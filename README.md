# Coaching Application

This repository contains the codebase for a Next.js + TypeScript application that aims to facilitate online coaching services. This platform enables coaches to manage their clients and allows clients to interact with their coaches seamlessly. The application leverages various technologies including Next.js, TypeScript, Supabase, and Stripe.

## Architecture

The application follows the standard Next.js structure with several additional directories and files to accommodate the specific needs of the coaching platform. The codebase is structured as follows:

1. **Pages**: In Next.js, any file inside the pages directory becomes a route. We utilize dynamic routing for pages that need to render different content based on the URL's path.

2. **API Routes**: Next.js supports API routes out of the box. We've used this feature to create API endpoints that interact with the Stripe service for payments and SendGrid for emails.

3. **Types**: TypeScript types used across the application are defined in the types directory. These are used to provide static typing for our data, improving maintainability and developer productivity.

4. **Components**: This directory is divided into two subdirectories:

   - **App Components**: These components are specific to our application. They implement specific features required by the coaching platform, like form handling, page layout, etc.
   - **Base Components**: These are context-agnostic components that can be reused in various parts of the application. They include basic UI elements like buttons, inputs, etc.

5. **Hooks**: These are custom React hooks created for the application. They encapsulate common logic that affects components, improving code reuse and readability.

6. **High Order Components (HOC)**: These components are functions that take a component and return a new component with additional props or functionality.

7. **Utilities**: This directory is split into two parts:

   - **Data Service Functions**: These are functions that encapsulate the application's interactions with its underlying data stored in Supabase. They handle CRUD operations and abstract away the details of data access, making it easier to interact with the data in our application.
   - **Initialization Functions**: These are functions used to initialize various services used in the application. For example, @/app/utils/initStripe initializes the Stripe service.

## Getting Started

Clone this repository and install the dependencies using `yarn install`. You'll need to set up environment variables for the Supabase URL and public key, SendGrid API key, and Stripe public key.

To run the application locally, use `yarn dev`. For a production build, first use `yarn build`, then `yarn start`. 
