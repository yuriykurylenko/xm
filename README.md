# Coaching Subscription Application

This application is designed to facilitate a seamless coaching subscription experience. Built with Next.js, Supabase, and TypeScript, the application provides users with the ability to apply to work with a coach, confirm their coaching subscriptions, and receive updates and confirmations through email.

## Application Architecture

The application is structured as a Next.js application with server-side rendering, which interacts with a Supabase back-end for data retrieval and manipulations, and uses external services for email notifications and payments.

### Frontend

The frontend of the application is built using Next.js and TypeScript. The major components of the application include:

- **Page Components**: These are the primary components responsible for rendering the application pages. They interact with the back-end services to fetch and manipulate data as needed. Examples include `@/pages/application/[coachSlug].tsx`, `@/pages/[coachSlug]/success.tsx` and `@/pages/subscription/[subscription_id].tsx`.

- **API Routes**: These components manage the interactions with external services, such as sending emails with SendGrid (in `@/pages/api/send_payment_link.ts`) and creating subscriptions with Stripe (in `@/pages/api/subscription.ts`).

- **Utility Functions**: These are helper functions used throughout the application to perform common operations. For example, `@/app/utils/api` includes API fetch functions, and `@/app/utils/initStripe` initializes the Stripe service.

- **Higher-Order Components**: These components add additional functionalities to the page components, such as authentication (in `@/app/hoc/withAuth.tsx`).

- **Context-Agnostic Components**: These components are designed to be reusable and unaware of their context. They are used across different components and include form elements such as input fields and buttons, and layout components like `PageContainer`.

- **Custom Hooks**: These hooks encapsulate common logic that can be reused across multiple components, such as authentication logic in `@/app/hooks/useAuth.ts`.

### Backend

The backend services primarily include Supabase as the primary database and authentication service, and third-party APIs, such as Stripe for payment processing and SendGrid for sending emails.

- **Supabase**: Supabase is used for storing application data, user authentication and serverless functions.

- **Stripe**: This service is used to handle customer creation, setup of payment methods, and subscription creation.

- **SendGrid**: This service is used to send emails to users, such as the payment confirmation email sent when a user subscribes.

## How to Run the Application

Please refer to the official Next.js documentation on how to build and run a Next.js application: https://nextjs.org/docs/getting-started. Remember to set up your environment variables for Supabase, Stripe and SendGrid services according to their respective documentations.