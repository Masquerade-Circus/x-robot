import { documentate } from "../lib/documentate";
import {
  context,
  dangerState,
  description,
  entry,
  guard,
  immediate,
  init,
  initial,
  machine,
  nested,
  parallel,
  primaryState,
  state,
  successState,
  transition,
  warningState,
} from "../lib";
import { describe, it } from "mocha";
import expect from "expect";
import fs from "fs";
import path from "path";

const MEDIA_DIR = path.join(__dirname, "..", "media");

describe("Documentation examples", () => {
  it("Simple Example (stoplight)", async () => {
    const stoplight = machine(
      "Stoplight",
      init(initial("green")),
      state("green", transition("next", "yellow")),
      state("yellow", transition("next", "red")),
      state("red", transition("next", "green"))
    );

    const result = await documentate(stoplight, { format: "mermaid", level: "high" });

    expect(result.mermaid).toBeDefined();
    expect(result.mermaid).toContain("stateDiagram-v2");
    expect(result.mermaid).toContain("green");
    expect(result.mermaid).toContain("yellow");
    expect(result.mermaid).toContain("red");

    fs.writeFileSync(path.join(MEDIA_DIR, "stoplight.mmd"), result.mermaid!);
  });

  it("Async Example (fetch machine)", async () => {
    async function fetchDog() {
      let response = await fetch("https://dog.ceo/api/breeds/image/random");
      let json = await response.json();
      return json.data;
    }

    const fetchMachine = machine(
      "Dog API",
      init(context({ dog: null, error: null }), initial("idle")),
      state("idle", transition("fetch", "loading")),
      state("loading", entry(fetchDog, "resolved", "rejected"), transition("cancel", "idle")),
      state("resolved", immediate("idle")),
      state("rejected")
    );

    const result = await documentate(fetchMachine, { format: "mermaid", level: "high" });

    expect(result.mermaid).toBeDefined();
    expect(result.mermaid).toContain("stateDiagram-v2");
    expect(result.mermaid).toContain("idle");
    expect(result.mermaid).toContain("loading");
    expect(result.mermaid).toContain("resolved");
    expect(result.mermaid).toContain("rejected");

    fs.writeFileSync(path.join(MEDIA_DIR, "fetch-machine.mmd"), result.mermaid!);
  });

  it("Nested Example", async () => {
    const stopwalk = machine(
      "Stopwalk",
      init(initial("wait")),
      state("wait", transition("start", "walk")),
      state("walk", transition("stop", "wait"))
    );

    const canGoToGreen = () => stopwalk.current === "wait";

    const stoplight = machine(
      "Stoplight",
      init(initial("green")),
      state("green", transition("next", "yellow")),
      state("yellow", transition("next", "red")),
      state("red", nested(stopwalk, "start"), immediate("green", guard(canGoToGreen)))
    );

    const result = await documentate(stoplight, { format: "mermaid", level: "high" });

    expect(result.mermaid).toBeDefined();
    expect(result.mermaid).toContain("stateDiagram-v2");
    expect(result.mermaid).toContain("green");
    expect(result.mermaid).toContain("yellow");
    expect(result.mermaid).toContain("red");
    expect(result.mermaid).toContain("canGoToGreen");

    fs.writeFileSync(path.join(MEDIA_DIR, "nested-stoplight.mmd"), result.mermaid!);
  });

  it("Parallel Example", async () => {
    const boldMachine = machine(
      "Bold",
      init(initial("off")),
      state("on", transition("off", "off")),
      state("off", transition("on", "on"))
    );
    const underlineMachine = machine(
      "Underline",
      init(initial("off")),
      state("on", transition("off", "off")),
      state("off", transition("on", "on"))
    );
    const italicsMachine = machine(
      "Italics",
      init(initial("off")),
      state("on", transition("off", "off")),
      state("off", transition("on", "on"))
    );
    const listMachine = machine(
      "List",
      init(initial("none")),
      state("none", transition("bullets", "bullets"), transition("numbers", "numbers")),
      state("bullets", transition("none", "none")),
      state("numbers", transition("none", "none"))
    );
    const wordMachine = machine(
      "Word Machine",
      parallel(boldMachine, underlineMachine, italicsMachine, listMachine)
    );

    const result = await documentate(wordMachine, { format: "mermaid", level: "high" });

    expect(result.mermaid).toBeDefined();
    expect(result.mermaid).toContain("stateDiagram-v2");
    expect(result.mermaid).toContain("Word Machine");

    fs.writeFileSync(path.join(MEDIA_DIR, "parallel-word-machine.mmd"), result.mermaid!);
  });

  it("Recipe: Wizard", async () => {
    const step1 = machine("Step1", init(initial("pending")),
      state("pending", transition("next", "completed")),
      state("completed")
    );
    const step2 = machine("Step2", init(initial("pending")),
      state("pending", transition("next", "completed")),
      state("completed")
    );
    const step3 = machine("Step3", init(initial("pending")),
      state("pending", transition("next", "completed")),
      state("completed")
    );
    const wizardMachine = machine(
      "Wizard",
      init(initial("step1"), context({ data: {} })),
      state("step1", nested(step1, "next"), transition("back", "step1")),
      state("step2", nested(step2, "next"), transition("back", "step1")),
      state("step3", nested(step3, "next"), transition("back", "step2")),
      state("complete", entry(console.log))
    );
    const result = await documentate(wizardMachine, { format: "mermaid", level: "high" });
    expect(result.mermaid).toBeDefined();
    expect(result.mermaid).toContain("Wizard");
    fs.writeFileSync(path.join(MEDIA_DIR, "wizard.mmd"), result.mermaid!);
  });

  it("Recipe: Modal Dialog", async () => {
    const prepareContent = (ctx: any) => { ctx.content = { title: "Confirm" }; };
    const handleConfirmation = async (ctx: any) => { };
    const clearContent = (ctx: any) => { ctx.content = null; };
    const modalMachine = machine(
      "Modal",
      init(initial("closed"), context({ content: null })),
      state("closed", transition("open", "opening")),
      state("opening", entry(prepareContent, "open", "closed")),
      state("open", transition("close", "closing"), transition("confirm", "confirming"), transition("cancel", "closing")),
      state("confirming", entry(handleConfirmation, "closed", "error")),
      state("closing", entry(clearContent, "closed")),
      state("error", transition("close", "closing"))
    );
    const result = await documentate(modalMachine, { format: "mermaid", level: "high" });
    expect(result.mermaid).toBeDefined();
    expect(result.mermaid).toContain("Modal");
    fs.writeFileSync(path.join(MEDIA_DIR, "modal-dialog.mmd"), result.mermaid!);
  });

  it("Recipe: Login Flow", async () => {
    const authenticateUser = async (ctx: any) => { };
    const loginMachine = machine(
      "Login",
      init(initial("idle"), context({ user: null, error: null })),
      state("idle", transition("login", "authenticating")),
      state("authenticating", entry(authenticateUser, "authenticated", "error")),
      state("authenticated", transition("logout", "idle")),
      state("error", transition("retry", "idle"), transition("login", "authenticating"))
    );
    const result = await documentate(loginMachine, { format: "mermaid", level: "high" });
    expect(result.mermaid).toBeDefined();
    expect(result.mermaid).toContain("Login");
    fs.writeFileSync(path.join(MEDIA_DIR, "login-flow.mmd"), result.mermaid!);
  });

  it("Recipe: Form Validation", async () => {
    const canSubmitForm = (ctx: any) => true;
    const validateFormInContext = (ctx: any) => { };
    const submitForm = async (ctx: any) => { };
    const formMachine = machine(
      "Form",
      init(initial("pristine"), context({ values: {}, errors: {}, submitted: false })),
      state("pristine", transition("change", "dirty")),
      state("dirty", transition("validate", "validating"), transition("submit", "validating", guard(canSubmitForm))),
      state("validating", entry(validateFormInContext, "valid", "invalid")),
      state("valid", transition("submit", "submitting")),
      state("invalid", transition("change", "dirty"), transition("submit", "invalid")),
      state("submitting", entry(submitForm, "success", "error")),
      state("success", transition("reset", "pristine")),
      state("error", transition("retry", "valid"), transition("reset", "pristine"))
    );
    const result = await documentate(formMachine, { format: "mermaid", level: "high" });
    expect(result.mermaid).toBeDefined();
    expect(result.mermaid).toContain("Form");
    fs.writeFileSync(path.join(MEDIA_DIR, "form-validation.mmd"), result.mermaid!);
  });

  it("Recipe: API Fetch", async () => {
    const fetchData = async (ctx: any) => { };
    const fetchMachine = machine(
      "Fetch",
      init(initial("idle"), context({ data: null, error: null, params: null })),
      state("idle", transition("fetch", "loading")),
      state("loading", entry(fetchData, "success", "error")),
      state("success", transition("refetch", "loading"), transition("clear", "idle")),
      state("error", transition("retry", "loading"), transition("clear", "idle"))
    );
    const result = await documentate(fetchMachine, { format: "mermaid", level: "high" });
    expect(result.mermaid).toBeDefined();
    expect(result.mermaid).toContain("Fetch");
    fs.writeFileSync(path.join(MEDIA_DIR, "api-fetch.mmd"), result.mermaid!);
  });

  it("Recipe: Order Flow", async () => {
    const updateState = (ctx: any, payload: any) => ({ ...ctx, ...payload });
    const getClient = async () => {};
    const getItemsAndTaxes = async () => {};
    const getAmounts = async () => {};
    const draft = async () => {};
    const expireDraft = async () => {};
    const getStore = async () => {};
    const getRetailer = async () => {};
    const setI18N = async () => {};
    const validatePickupTime = async () => {};
    const getCard = async () => {};
    const create = async () => {};
    const authorize = async () => {};
    const capture = async () => {};
    const voidOrRefundOrder = async () => {};
    const update = async () => {};
    const sendNotificationToClient = async () => {};
    const sendNotificationToStore = async () => {};
    const increaseSuccessfulStoreOrderCount = async () => {};
    const decreaseSuccessfulStoreOrderCount = async () => {};
    const setError = async () => {};
    const createTransaction = async () => {};
    const throwError = async () => {};
    const setTimeoutTasks = async () => {};
    const getTransaction = async () => {};
    const expire = async () => {};
    const updateTransaction = async () => {};
    const setCancelledById = async () => {};

    const m = machine('Order',
      init(context(() => ({})), initial('draft')),
      dangerState('fatal', description('Fatal error'), entry(setError), entry(createTransaction), entry(update), entry(sendNotificationToClient), entry(throwError)),
      dangerState('authorizationFailure', description('Payment authorization failed'), entry(setError), entry(createTransaction), entry(update), entry(sendNotificationToClient), entry(throwError)),
      dangerState('voidOrRefundFailure', description('Void or refund failed'), entry(setError), entry(updateTransaction), entry(update), entry(throwError)),
      dangerState('captureFailure', description('Payment capture failed'), entry(setError), entry(voidOrRefundOrder), entry(update), entry(updateTransaction), entry(sendNotificationToClient), entry(sendNotificationToStore), entry(throwError)),
      state('draft', description('Draft order'), entry(getClient), entry(getItemsAndTaxes), entry(getAmounts), entry(draft), transition('expiredDraft', 'expiredDraft'), transition('create', 'created')),
      warningState('expiredDraft', description('Draft expired'), entry(getClient), entry(expireDraft)),
      primaryState('created', description('Order created'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(validatePickupTime), entry(getItemsAndTaxes), entry(getAmounts), entry(getCard), entry(create), entry(authorize), entry(createTransaction), entry(update), transition('expire', 'expired'), transition('waitingForStore', 'waitingForStore')),
      warningState('expired', description('Order expired'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(expire), entry(getTransaction), entry(voidOrRefundOrder), entry(update), entry(updateTransaction), entry(sendNotificationToClient)),
      primaryState('waitingForStore', description('Waiting for store confirmation'), entry(sendNotificationToClient), entry(setTimeoutTasks), entry(update), transition('expire', 'expired'), transition('cancel', 'cancelledByStore'), transition('cancelByClient', 'cancelledByClient'), transition('cancelByCustomerSupport', 'cancelledByCustomerSupport'), transition('requestChanges', 'changesRequestedByStore'), transition('process', 'processing')),
      warningState('cancelledByStore', description('Cancelled by store'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(update), entry(voidOrRefundOrder), entry(update), entry(updateTransaction), entry(sendNotificationToClient)),
      warningState('cancelledByClient', description('Cancelled by client'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(getTransaction), entry(voidOrRefundOrder), entry(update), entry(sendNotificationToStore), entry(sendNotificationToClient)),
      warningState('cancelledByCustomerSupport', description('Cancelled by customer support'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(getTransaction), entry(setCancelledById), entry(voidOrRefundOrder), entry(decreaseSuccessfulStoreOrderCount), entry(update), entry(updateTransaction), entry(sendNotificationToClient)),
      state('changesRequestedByStore', description('Changes requested by store'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(getAmounts), entry(update), entry(sendNotificationToClient), transition('rejectChanges', 'changesRejectedByClient'), transition('acceptChanges', 'changesAcceptedByClient'), transition('cancelByCustomerSupport', 'cancelledByCustomerSupport')),
      warningState('changesRejectedByClient', description('Changes rejected by client'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(getTransaction), entry(voidOrRefundOrder), entry(update), entry(updateTransaction), entry(sendNotificationToClient), entry(sendNotificationToStore)),
      state('changesAcceptedByClient', description('Changes accepted by client'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(update), entry(sendNotificationToStore), transition('process', 'processing'), transition('cancel', 'cancelledByStore')),
      primaryState('processing', description('Processing order'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(update), entry(sendNotificationToClient), transition('cancelProcessing', 'processingCancelledByStore'), transition('finishProcessing', 'processed'), transition('cancelByCustomerSupport', 'cancelledByCustomerSupport')),
      warningState('processingCancelledByStore', description('Processing cancelled by store'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(getTransaction), entry(voidOrRefundOrder), entry(update), entry(updateTransaction), entry(sendNotificationToClient)),
      state('processed', description('Order processed'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(getTransaction), entry(update), entry(capture), entry(updateTransaction), transition('ready', 'ready')),
      primaryState('ready', description('Ready for delivery'), entry(increaseSuccessfulStoreOrderCount), entry(update), entry(sendNotificationToClient), transition('complete', 'completed'), transition('cancelReady', 'readyCancelledByStore'), transition('cancelByCustomerSupport', 'cancelledByCustomerSupport'), transition('deliver', 'waitingForDelivery')),
      warningState('readyCancelledByStore', description('Ready cancelled by store'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(getTransaction), entry(voidOrRefundOrder), entry(decreaseSuccessfulStoreOrderCount), entry(update), entry(updateTransaction), entry(sendNotificationToClient)),
      state('waitingForDelivery', description('Waiting for delivery'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(getTransaction), entry(update), transition('complete', 'completed'), transition('cancelWaitingForDelivery', 'waitingForDeliveryCancelledByStore'), transition('cancelByCustomerSupport', 'cancelledByCustomerSupport')),
      warningState('waitingForDeliveryCancelledByStore', description('Waiting for delivery cancelled by store'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(getTransaction), entry(voidOrRefundOrder), entry(decreaseSuccessfulStoreOrderCount), entry(update), entry(updateTransaction), entry(sendNotificationToClient)),
      successState('completed', description('Order completed'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(update), transition('cancelCompleted', 'completedCancelledByStore'), transition('cancelByCustomerSupport', 'cancelledByCustomerSupport')),
      warningState('completedCancelledByStore', description('Completed cancelled by store'), entry(getClient), entry(getStore), entry(getRetailer), entry(setI18N), entry(getCard), entry(getItemsAndTaxes), entry(getTransaction), entry(voidOrRefundOrder), entry(decreaseSuccessfulStoreOrderCount), entry(update), entry(updateTransaction), entry(sendNotificationToClient))
    );

    const result = await documentate(m, { format: "mermaid", level: "high" });
    expect(result.mermaid).toBeDefined();
    expect(result.mermaid).toContain("Order");
    fs.writeFileSync(path.join(MEDIA_DIR, "order-flow.mmd"), result.mermaid!);
  });
});
