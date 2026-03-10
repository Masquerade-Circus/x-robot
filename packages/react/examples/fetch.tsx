import React, { FormEvent, useState } from "react";
import { context, entry, init, initial, machine, state, transition } from "x-robot";
import { useMachine } from "@x-robot/react";

async function submitCheckout(contextValue: any) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!contextValue.email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  return {
    ...contextValue,
    error: undefined,
    receipt: "order_123"
  };
}

const checkoutMachine = machine(
  "Checkout form",
  init(initial("editing"), context({ email: "", receipt: undefined, error: undefined })),
  state("editing", transition("submit", "submitting")),
  state(
    "submitting",
    entry(async (ctx: any, payload?: { email: string }) => {
      return submitCheckout({
        ...ctx,
        email: payload?.email ?? ctx.email,
        error: undefined,
        receipt: undefined
      });
    }, "success", "failure")
  ),
  state("success", transition("reset", "editing")),
  state("failure", transition("reset", "editing"))
);

export function CheckoutExample() {
  const [email, setEmail] = useState("");
  const { current, context, invoke } = useMachine(checkoutMachine, { autostart: true });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void invoke("submit", { email });
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Email
        <input value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>

      <button type="submit" disabled={current === "submitting"}>
        {current === "submitting" ? "Submitting..." : "Submit order"}
      </button>

      {current === "success" || current === "failure" ? (
        <button type="button" onClick={() => invoke("reset")}>
          Edit order
        </button>
      ) : null}

      <p>State: {current}</p>

      {current === "failure" ? <p role="alert">Enter a valid email address.</p> : null}
      {context.receipt ? <p>Receipt: {context.receipt}</p> : null}
    </form>
  );
}
