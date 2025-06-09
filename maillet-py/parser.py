from typing import Dict, Any, Optional
from langgraph.graph import StateGraph, END
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import ToolMessage
from langchain_google_genai import ChatGoogleGenerativeAI
import requests
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from langgraph.graph.message import add_messages
from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage
import os
from dotenv import load_dotenv
from returnMails import send_balance_email, send_confirmation_email, send_failure_email, send_transaction_history_email, send_creation_confirmation
from transactionHelpers import process_transaction_data


load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")


class AgentState(TypedDict):
    """The state of the agent."""
    messages: Annotated[Sequence[BaseMessage], add_messages]
    number_of_steps: int


class SendTransactionInput(BaseModel):
    fromEmail: str = Field(
        description="The sender's email address")
    toEmailOrAddress: str = Field(
        description="The recipient's email address or wallet address/public key")
    amount: str = Field(
        description="The amount of cryptocurrency to send")


@tool("send_wallet_transaction", args_schema=SendTransactionInput, return_direct=True)
def send_wallet_transaction(fromEmail: str, toEmailOrAddress: str, amount: float) -> Dict[str, Any]:
    """
    Send cryptocurrency transaction through the wallet API.

    Args:
        fromEmail (str): The sender's email address
        toEmailOrAddress (str): The recipient's email address or wallet address/public key
        amount (float): The amount of cryptocurrency to send

    Returns:
        Dict[str, Any]: API response containing transaction details or error information

    Raises:
        Exception: If the API request fails or returns an error
    """
    try:
        # Get the API URL from environment variables
        api_url = os.getenv('WALLET_API_URL')
        if not api_url:
            raise ValueError("WALLET_API_URL environment variable is not set")

        # Construct the full endpoint URL
        endpoint = f"{api_url}/api/wallet/send"

        # Prepare the request payload
        payload = {
            "fromEmail": fromEmail,
            "toEmailOrAddress": toEmailOrAddress,
            "amount": amount,
            "tokenAddress": "native"
        }

        # Make the POST request
        response = requests.post(
            endpoint,
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        # Check if the request was successful
        response.raise_for_status()

        # Return the JSON response
        transaction_details = response.json()
        transaction_id = transaction_details['transactionHash']
        send_confirmation_email(fromEmail, fromEmail,
                                toEmailOrAddress, amount, transaction_id)
    except Exception as e:
        print(str(e))
        send_failure_email(fromEmail, fromEmail,
                           toEmailOrAddress, amount, "Not available", str(e))
        return {"error": "Request failed", "details": str(e)}


class BalanceCheckInput(BaseModel):
    fromEmail: str = Field(
        description="The sender's email address")


@tool("get_wallet_balance", args_schema=BalanceCheckInput, return_direct=True)
def get_wallet_balance(fromEmail: str) -> Optional[Dict[str, Any]]:
    """
    Fetch wallet balance for a given email address from the wallet API.

    Args:
        fromEmail (str): The sender's email address

    Returns:
        Optional[Dict[str, Any]]: API response containing balance information, or None if error occurs
    """
    try:
        # Get API URL from environment
        api_url = os.getenv('WALLET_API_URL')
        if not api_url:
            raise ValueError("WALLET_API_URL environment variable not set")

        # Construct the full endpoint URL
        endpoint = f"{api_url}/api/wallet/balance"

        # Prepare request payload
        payload = {
            "email": fromEmail,
            "tokenAddress": "native"
        }

        # Make POST request
        response = requests.post(endpoint, json=payload)
        response.raise_for_status()

        balance_details = response.json()
        amount = balance_details["balance"]
        send_balance_email(fromEmail, fromEmail, amount)

    except Exception as e:
        print(str(e))
        return None


@tool("get_wallet_history", args_schema=BalanceCheckInput, return_direct=True)
def get_wallet_history(fromEmail: str) -> Optional[Dict[str, Any]]:
    """
    Fetch wallet history for a given email address from the wallet API.

    Args:
        fromEmail (str): The sender's email address

    Returns:
        Optional[Dict[str, Any]]: API response containing history, or None if error occurs
    """
    try:
        # Get API URL from environment
        api_url = os.getenv('WALLET_API_URL')
        if not api_url:
            raise ValueError("WALLET_API_URL environment variable not set")

        # Construct the full endpoint URL
        endpoint = f"{api_url}/api/wallet/transactions"

        # Prepare request payload
        payload = {
            "email": fromEmail,
            "limit": 10
        }

        # Make POST request
        response = requests.post(endpoint, json=payload)
        response.raise_for_status()

        transaction_data = response.json()
        processed_transaction_data = process_transaction_data(
            transaction_data)
        send_transaction_history_email(fromEmail, processed_transaction_data)

    except Exception as e:
        print(str(e))
        return None


@tool("create_wallet_account", args_schema=BalanceCheckInput, return_direct=True)
def create_wallet_account(fromEmail: str) -> Optional[Dict[str, Any]]:
    """
    Creates an account with the specified email

    Args:
        fromEmail (str): The sender's email address

    Returns:
        Optional[Dict[str, Any]]: Account opening details
    """
    try:
        # Get API URL from environment
        api_url = os.getenv('WALLET_API_URL')
        if not api_url:
            raise ValueError("WALLET_API_URL environment variable not set")

        # Construct the full endpoint URL
        endpoint = f"{api_url}/api/account/create"

        # Prepare request payload
        payload = {
            "email": fromEmail,
        }

        # Make POST request
        response = requests.post(endpoint, json=payload)
        response.raise_for_status()

        account_data = response.json()
        public_key = account_data["publicKey"]
        send_confirmation_email(fromEmail, public_key)

    except Exception as e:
        print(str(e))
        return None


tools = [get_wallet_balance, send_wallet_transaction,
         get_wallet_history, create_wallet_account]


llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.5,
    max_retries=2,
    google_api_key=api_key,
)

model = llm.bind_tools(tools)


tools_by_name = {tool.name: tool for tool in tools}


def call_tool(state: AgentState):
    outputs = []
    for tool_call in state["messages"][-1].tool_calls:
        tool_result = tools_by_name[tool_call["name"]].invoke(
            tool_call["args"])
        outputs.append(
            ToolMessage(
                content=tool_result,
                name=tool_call["name"],
                tool_call_id=tool_call["id"],
            )
        )
    return {"messages": outputs}


def call_model(
    state: AgentState,
    config: RunnableConfig,
):
    response = model.invoke(state["messages"], config)
    return {"messages": [response]}


def should_continue(state: AgentState):
    messages = state["messages"]
    if not messages[-1].tool_calls:
        return "end"
    return "continue"


workflow = StateGraph(AgentState)

workflow.add_node("llm", call_model)
workflow.add_node("tools",  call_tool)
workflow.set_entry_point("llm")
workflow.add_conditional_edges(
    "llm",
    should_continue,
    {
        "continue": "tools",
        "end": END,
    },
)
workflow.add_edge("tools", "llm")

graph = workflow.compile()
print("Graph compilation finished")
