import { defineComponent, ref } from "vue";
import { context, entry, init, initial, machine, state, transition } from "x-robot";
import { useMachine } from "@x-robot/vue";

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
  init(
    initial("editing"),
    context({ email: "", receipt: undefined, error: undefined })
  ),
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

export const CheckoutExample = defineComponent({
  name: "CheckoutExample",
  setup() {
    const email = ref("");
    const { current, context, invoke } = useMachine(checkoutMachine, {
      autostart: true
    });

    function submit() {
      void invoke("submit", { email: email.value });
    }

    function reset() {
      void invoke("reset");
      email.value = context.value.email ?? "";
    }

    return {
      context,
      current,
      email,
      reset,
      submit
    };
  },
  template: `
    <form @submit.prevent="submit">
      <label>
        Email
        <input v-model="email" />
      </label>

      <button type="submit" :disabled="current === 'submitting'">
        {{ current === "submitting" ? "Submitting..." : "Submit order" }}
      </button>

      <button v-if="current === 'success' || current === 'failure'" type="button" @click="reset">
        Edit order
      </button>

      <p>State: {{ current }}</p>

      <p v-if="current === 'failure'" role="alert">Enter a valid email address.</p>
      <p v-if="context.receipt">Receipt: {{ context.receipt }}</p>
    </form>
  `
});
