# Coaching Platform

This is a coaching platform built with Next.js, TypeScript, and Stripe. It allows coaches to manage their clients and clients to subscribe to their coaches.

## Features

- Coaches can sign up and manage their clients.
- Clients can apply to work with a coach.
- Clients can subscribe to a coach's services with a monthly payment.
- Payments are handled with Stripe.

## Project Structure

The project is structured as a standard Next.js application with the addition of a `app` directory for shared components, hooks, and utilities.

- `pages`: This directory contains all the pages of the application, including API routes.
- `app/components`: This directory contains shared React components.
- `app/hooks`: This directory contains shared React hooks.
- `app/hoc`: This directory contains higher-order components.
- `app/utils`: This directory contains utility functions, including API calls.
- `app/types`: This directory contains TypeScript type definitions.

## Setup

1. Clone the repository.
2. Install the dependencies with `npm install`.
3. Copy the `.env.example` file to `.env` and fill in your Stripe API keys and other configuration values.
4. Run the development server with `npm run dev`.

## Testing

Run the tests with `npm test`.

## Deployment

The application can be deployed on any platform that supports Next.js. For detailed instructions, see the [Next.js deployment documentation](https://nextjs.org/docs/deployment).