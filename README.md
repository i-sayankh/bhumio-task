# Single Page React Form App

## Overview

This is a small single-page React application that demonstrates:

- Controlled form handling
- Immediate UI feedback
- Mock API with randomized behavior
- Automatic retry logic for temporary failures
- Duplicate submission prevention
- Idempotent record storage
- Clear state transitions in the UI

The application collects:

- Email
- Amount (number)

---

## Features

### 1. Immediate Pending State

As soon as the user submits the form:

- The UI transitions to `pending`
- The submit button becomes disabled
- A message indicates submission in progress

This ensures responsive feedback without waiting for the API.

---

### 2. Mock API Behavior

The mock API randomly simulates three scenarios:

- **Immediate success (200)**
- **Temporary failure (503)**
- **Delayed success (5–10 seconds)**

This helps simulate real-world unreliable network conditions.

---

## State Transitions

The UI behaves like a small state machine.

### Possible States

- `idle`
- `pending`
- `retrying`
- `success`
- `error`

### Transition Flow

```
idle
  ↓
pending
  ↓
success
```

or

```
idle
  ↓
pending
  ↓
retrying
  ↓
success
```

or

```
idle
  ↓
pending
  ↓
retrying
  ↓
error
```

### State Definitions

- **idle**  
  Initial state before submission.

- **pending**  
  First API call has been initiated.

- **retrying**  
  A temporary failure occurred and the system is retrying automatically.

- **success**  
  Submission completed successfully.

- **error**  
  Maximum retries reached and submission failed.

The UI always reflects the current state clearly.

---

## Retry Logic

The app automatically retries when:

- The API responds with `503 Temporary Failure`.

### Rules

- Maximum retry attempts: **3**
- Retries occur immediately after a 503 response
- Retry counter is stored using a `ref`
- Retries stop once:
  - A success response is received, or
  - Maximum retry limit is reached

### Why Only Retry 503?

503 represents a temporary failure, which is retry-safe.  
Other errors are treated as terminal failures.

---

## Duplicate Submission Prevention

Duplicate prevention is handled at two levels.

### 1. UI-Level Lock

- A `isSubmitting` reference blocks additional submissions.
- The submit button is disabled while a request is active.
- Multiple clicks cannot trigger multiple requests.

### 2. Idempotent Record Storage

Each submission generates a unique:

```
requestId = crypto.randomUUID()
```

When a response is received:

- The records list is checked for an existing `requestId`
- If it already exists, it is ignored
- If it does not exist, it is added

This guarantees:

- No duplicate records in UI
- Safe handling of delayed responses
- Safe handling of race conditions

---

## Edge Case Covered

Scenario:

1. First request is delayed (5–10 seconds).
2. Retry succeeds earlier.
3. Original delayed request finally resolves.

Without deduplication, this would create duplicates.

Because we store and validate by `requestId`, the second resolution is ignored.

---

## Installation

### Using Vite (Recommended)

```bash
npm create vite@latest my-app
cd my-app
npm install
npm run dev
```

Select:
- Framework → React
- Variant → JavaScript

Then replace `App.jsx` with the provided implementation.

---

## How to Run

```bash
npm install
npm run dev
```

Open the local development URL shown in the terminal.

---

## Architectural Decisions

### Why use `useRef` for submission state?

`useRef` allows us to:

- Prevent duplicate submissions without triggering re-renders
- Maintain mutable state across async retries

### Why generate a unique request ID?

This simulates real-world idempotency keys used in:

- Payment systems
- Distributed systems
- Retry-safe APIs

### Why not store retry count in state?

Retries are internal logic and do not require UI-based re-rendering for every increment.

---

## Summary

This project demonstrates:

- Client-side resilience patterns
- Idempotency
- Retry mechanisms
- Clear UI state modeling
- Race condition safety

It is structured to reflect real-world frontend engineering practices.
