import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    if (evt.type === 'user.created') {
      console.log('userId:', evt.data.id)

      // Extract email from the webhook event
      const email = evt.data.email_addresses?.[0]?.email_address

      if (!email) {
        console.error('No email found in webhook event')
        return new Response('No email found in webhook event', { status: 400 })
      }

      try {
        // Get the base URL for the internal API call
        const baseUrl = process.env.NEXTAUTH_URL ||
          process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
          'http://localhost:3000'

        // Call the internal account creation API
        const response = await fetch(`${baseUrl}/api/account/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Account creation failed:', errorData)
          return new Response('Account creation failed', { status: 500 })
        }

        const accountData = await response.json()
        console.log('Account creation result:', accountData)

        if (accountData.accountCreated) {
          console.log('New account created for user:', email)
        } else {
          console.log('Account already existed for user:', email)
        }

      } catch (apiError) {
        console.error('Error calling account creation API:', apiError)
        return new Response('Error creating account', { status: 500 })
      }
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}
