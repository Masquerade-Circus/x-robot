import { documentate } from "../lib/documentate";
import type { DocumentateOptions } from "../lib/documentate/types";
import {
  context,
  dangerState,
  entry,
  exit,
  immediate,
  init,
  initial,
  machine,
  primaryState,
  state,
  successState,
  transition,
  warningState,
} from "../lib";
import { describe, it } from "mocha";

import expect from "expect";
import fs from "fs";
import { validate } from "../lib/validate";

describe("X-Robot", () => {
  function getMachine() {
    function updateState(context, payload) {
      return { ...context, ...payload };
    }

    // Async entries
    async function getClient() {}
    async function getItemsAndTaxes() {}
    async function getAmounts() {}
    async function draft() {}
    async function expireDraft() {}
    async function getStore() {}
    async function getRetailer() {}
    async function setI18N() {}
    async function validatePickupTime() {}
    async function getCard() {}
    async function create() {}
    async function authorize() {}
    async function capture() {}
    async function voidOrRefundOrder() {}
    async function update() {}
    async function sendNotificationToClient() {}
    async function sendNotificationToStore() {}
    async function increaseSuccessfulStoreOrderCount() {}
    async function decreaseSuccessfulStoreOrderCount() {}
    async function setError() {}
    async function createTransaction() {}
    async function throwError() {}
    async function setTimeoutTasks() {}
    async function getTransaction() {}
    async function expire() {}
    async function updateTransaction() {}
    async function setCancelledById() {}

    // Cached actions
    let actionGetClient = entry(getClient);
    let actionGetItemsAndTaxes = entry(getItemsAndTaxes);
    let actionGetAmounts = entry(getAmounts);
    let actionDraft = entry(draft);
    let actionExpireDraft = entry(expireDraft);
    let actionGetStore = entry(getStore);
    let actionGetRetailer = entry(getRetailer);
    let actionSetI18N = entry(setI18N);
    let actionValidatePickupTime = entry(validatePickupTime);
    let actionGetCard = entry(getCard);
    let actionCreate = entry(create);
    let actionAuthorize = entry(authorize, undefined, "authorizationFailure");
    let actionCapture = entry(capture, undefined, "captureFailure");
    let actionVoidOrRefundOrder = entry(voidOrRefundOrder, undefined, "voidOrRefundFailure");
    let actionUpdate = entry(update);
    let actionSendNotificationToClient = entry(sendNotificationToClient);
    let actionSendNotificationToStore = entry(sendNotificationToStore);
    let actionIncreaseSuccessfulStoreOrderCount = entry(increaseSuccessfulStoreOrderCount);
    let actionDecreaseSuccessfulStoreOrderCount = entry(decreaseSuccessfulStoreOrderCount);
    let actionSetError = entry(setError);
    let actionCreateTransaction = entry(createTransaction);
    let actionThrowError = entry(throwError);
    let actionSetTimeoutTasks = entry(setTimeoutTasks);
    let actionGetTransaction = entry(getTransaction);
    let actionExpire = entry(expire);
    let actionUpdateTransaction = entry(updateTransaction);
    let actionSetCancelledById = entry(setCancelledById);

    let myMachine = machine(
      "My machine",
      init(
        initial("draft"),
        context({})
      ),
      dangerState("fatal", actionUpdate, actionUpdateTransaction),
      state(
        "draft",
        actionGetClient,
        actionGetItemsAndTaxes,
        actionGetAmounts,
        actionDraft,
        transition("expiredDraft", "expiredDraft"),
        transition("create", "created")
      ),
      warningState("expiredDraft", actionGetClient, actionExpireDraft),
      primaryState(
        "created",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionValidatePickupTime,
        actionGetItemsAndTaxes,
        actionGetAmounts,
        actionGetCard,
        actionCreate,
        actionAuthorize,
        actionCreateTransaction,
        actionUpdate,
        immediate("waitingForStore"),
        transition("expire", "expired")
      ),
      warningState(
        "expired",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionExpire,
        actionGetTransaction,
        actionVoidOrRefundOrder,
        actionUpdate,
        actionUpdateTransaction,
        actionSendNotificationToClient
      ),
      dangerState("authorizationFailure", actionSetError, actionCreateTransaction, actionUpdate, actionSendNotificationToClient, actionThrowError),
      primaryState(
        "waitingForStore",
        actionSendNotificationToClient,
        actionSetTimeoutTasks,
        actionUpdate,
        transition("expire", "expired"),
        transition("cancel", "cancelledByStore"),
        transition("cancelByClient", "cancelledByClient"),
        transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
        transition("requestChanges", "changesRequestedByStore"),
        transition("process", "processing")
      ),
      warningState(
        "cancelledByStore",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionUpdate,
        actionVoidOrRefundOrder,
        actionUpdate,
        actionUpdateTransaction,
        actionSendNotificationToClient
      ),
      warningState(
        "cancelledByClient",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionGetTransaction,
        actionVoidOrRefundOrder,
        actionUpdate,
        actionSendNotificationToStore,
        actionSendNotificationToClient
      ),
      warningState(
        "cancelledByCustomerSupport",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionGetTransaction,
        actionSetCancelledById,
        actionVoidOrRefundOrder,
        actionDecreaseSuccessfulStoreOrderCount,
        actionUpdate,
        actionUpdateTransaction,
        actionSendNotificationToClient
      ),
      dangerState("voidOrRefundFailure", actionSetError, actionUpdateTransaction, actionUpdate, actionThrowError),

      state(
        "changesRequestedByStore",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionGetAmounts,
        actionUpdate,
        actionSendNotificationToClient,
        transition("rejectChanges", "changesRejectedByClient"),
        transition("acceptChanges", "changesAcceptedByClient"),
        transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
      ),
      warningState(
        "changesRejectedByClient",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionGetTransaction,
        actionVoidOrRefundOrder,
        actionUpdate,
        actionUpdateTransaction,
        actionSendNotificationToClient,
        actionSendNotificationToStore
      ),
      state(
        "changesAcceptedByClient",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionUpdate,
        actionSendNotificationToStore,
        transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
        transition("process", "processing"),
        transition("cancel", "cancelledByStore")
      ),
      primaryState(
        "processing",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionUpdate,
        actionSendNotificationToClient,
        transition("cancelProcessing", "processingCancelledByStore"),
        transition("finishProcessing", "processed"),
        transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
      ),
      warningState(
        "processingCancelledByStore",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionGetTransaction,
        actionVoidOrRefundOrder,
        actionUpdate,
        actionUpdateTransaction,
        actionSendNotificationToClient
      ),
      state(
        "processed",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionGetTransaction,
        actionUpdate,
        actionCapture,
        actionUpdateTransaction,
        immediate("ready")
      ),
      dangerState(
        "captureFailure",
        actionSetError,
        actionVoidOrRefundOrder,
        actionUpdate,
        actionUpdateTransaction,
        actionSendNotificationToClient,
        actionSendNotificationToStore,
        actionThrowError
      ),
      primaryState(
        "ready",
        actionIncreaseSuccessfulStoreOrderCount,
        actionUpdate,
        actionSendNotificationToClient,
        transition("complete", "completed"),
        transition("cancelReady", "readyCancelledByStore"),
        transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
        transition("deliver", "waitingForDelivery")
      ),
      warningState(
        "readyCancelledByStore",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionGetTransaction,
        actionVoidOrRefundOrder,
        actionDecreaseSuccessfulStoreOrderCount,
        actionUpdate,
        actionUpdateTransaction,
        actionSendNotificationToClient
      ),
      state(
        "waitingForDelivery",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionGetTransaction,
        actionUpdate,
        transition("complete", "completed"),
        transition("cancelWaitingForDelivery", "waitingForDeliveryCancelledByStore"),
        transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
      ),
      warningState(
        "waitingForDeliveryCancelledByStore",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionGetTransaction,
        actionVoidOrRefundOrder,
        actionDecreaseSuccessfulStoreOrderCount,
        actionUpdate,
        actionUpdateTransaction,
        actionSendNotificationToClient
      ),
      successState(
        "completed",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionUpdate,
        transition("cancelCompleted", "completedCancelledByStore"),
        transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
      ),
      warningState(
        "completedCancelledByStore",
        actionGetClient,
        actionGetStore,
        actionGetRetailer,
        actionSetI18N,
        actionGetCard,
        actionGetItemsAndTaxes,
        actionGetTransaction,
        actionVoidOrRefundOrder,
        actionDecreaseSuccessfulStoreOrderCount,
        actionUpdate,
        actionUpdateTransaction,
        actionSendNotificationToClient
      )
    );

    validate(myMachine);

    return myMachine;
  }

  it("should generate a diagram from a very high complexity machine", async () => {
    let myMachine = getMachine();

    const result = await documentate(myMachine, { format: 'plantuml', level: 'high' });
    let plantUmlCode = result.plantuml!;

    let expectedPlantUmlCode = `
@startuml

title My machine

state fatal<<danger>>
state draft<<default>>
state expiredDraft<<warning>>
state created<<primary>>
state expired<<warning>>
state authorizationFailure<<danger>>
state waitingForStore<<primary>>
state cancelledByStore<<warning>>
state cancelledByClient<<warning>>
state cancelledByCustomerSupport<<warning>>
state voidOrRefundFailure<<danger>>
state changesRequestedByStore<<default>>
state changesRejectedByClient<<warning>>
state changesAcceptedByClient<<default>>
state processing<<primary>>
state processingCancelledByStore<<warning>>
state processed<<default>>
state captureFailure<<danger>>
state ready<<primary>>
state readyCancelledByStore<<warning>>
state waitingForDelivery<<default>>
state waitingForDeliveryCancelledByStore<<warning>>
state completed<<success>>
state completedCancelledByStore<<warning>>

fatal: ├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:updateTransaction\\n └┬ success\\n  └ P:updateState
draft: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getAmounts\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:draft\\n └┬ success\\n  └ P:updateState
expiredDraft: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:expireDraft\\n └┬ success\\n  └ P:updateState
created: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:validatePickupTime\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getAmounts\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:create\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:authorize\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:authorizationFailure\\n├┬ A:createTransaction\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:update\\n └┬ success\\n  └ P:updateState
expired: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:expire\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:voidOrRefundOrder\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:voidOrRefundFailure\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:updateTransaction\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToClient\\n └┬ success\\n  └ P:updateState
authorizationFailure: ├┬ A:setError\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:createTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:sendNotificationToClient\\n│└┬ success\\n│ └ P:updateState\\n└ A:throwError
waitingForStore: ├┬ A:sendNotificationToClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setTimeoutTasks\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:update\\n └┬ success\\n  └ P:updateState
cancelledByStore: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:voidOrRefundOrder\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:voidOrRefundFailure\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:updateTransaction\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToClient\\n └┬ success\\n  └ P:updateState
cancelledByClient: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:voidOrRefundOrder\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:voidOrRefundFailure\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:sendNotificationToStore\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToClient\\n └┬ success\\n  └ P:updateState
cancelledByCustomerSupport: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setCancelledById\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:voidOrRefundOrder\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:voidOrRefundFailure\\n├┬ A:decreaseSuccessfulStoreOrderCount\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:updateTransaction\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToClient\\n └┬ success\\n  └ P:updateState
voidOrRefundFailure: ├┬ A:setError\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:updateTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n└ A:throwError
changesRequestedByStore: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getAmounts\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToClient\\n └┬ success\\n  └ P:updateState
changesRejectedByClient: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:voidOrRefundOrder\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:voidOrRefundFailure\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:updateTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:sendNotificationToClient\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToStore\\n └┬ success\\n  └ P:updateState
changesAcceptedByClient: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToStore\\n └┬ success\\n  └ P:updateState
processing: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToClient\\n └┬ success\\n  └ P:updateState
processingCancelledByStore: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:voidOrRefundOrder\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:voidOrRefundFailure\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:updateTransaction\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToClient\\n └┬ success\\n  └ P:updateState
processed: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:capture\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:captureFailure\\n└┬ A:updateTransaction\\n └┬ success\\n  └ P:updateState
captureFailure: ├┬ A:setError\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:voidOrRefundOrder\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:voidOrRefundFailure\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:updateTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:sendNotificationToClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:sendNotificationToStore\\n│└┬ success\\n│ └ P:updateState\\n└ A:throwError
ready: ├┬ A:increaseSuccessfulStoreOrderCount\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToClient\\n └┬ success\\n  └ P:updateState
readyCancelledByStore: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:voidOrRefundOrder\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:voidOrRefundFailure\\n├┬ A:decreaseSuccessfulStoreOrderCount\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:updateTransaction\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToClient\\n └┬ success\\n  └ P:updateState
waitingForDelivery: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getTransaction\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:update\\n └┬ success\\n  └ P:updateState
waitingForDeliveryCancelledByStore: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:voidOrRefundOrder\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:voidOrRefundFailure\\n├┬ A:decreaseSuccessfulStoreOrderCount\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:updateTransaction\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToClient\\n └┬ success\\n  └ P:updateState
completed: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:update\\n └┬ success\\n  └ P:updateState
completedCancelledByStore: ├┬ A:getClient\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getStore\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getRetailer\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:setI18N\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getCard\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getItemsAndTaxes\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:getTransaction\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:voidOrRefundOrder\\n│├┬ success\\n││└ P:updateState\\n│└┬ failure\\n│ ├ P:updateState\\n│ └ T:voidOrRefundFailure\\n├┬ A:decreaseSuccessfulStoreOrderCount\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:update\\n│└┬ success\\n│ └ P:updateState\\n├┬ A:updateTransaction\\n│└┬ success\\n│ └ P:updateState\\n└┬ A:sendNotificationToClient\\n └┬ success\\n  └ P:updateState

[*] --> draft
draft -[#tan]-> expiredDraft: expiredDraft
draft -[#lightsteelblue]-> created: create
created -[#indianred]-> authorizationFailure: authorizationFailure
created -[#lightsteelblue,dashed]-> waitingForStore: waitingForStore
created -[#tan]-> expired: expire
expired -[#indianred]-> voidOrRefundFailure: voidOrRefundFailure
waitingForStore -[#tan]-> expired: expire
waitingForStore -[#tan]-> cancelledByStore: cancel
waitingForStore -[#tan]-> cancelledByClient: cancelByClient
waitingForStore -[#tan]-> cancelledByCustomerSupport: cancelByCustomerSupport
waitingForStore -[#slategray]-> changesRequestedByStore: requestChanges
waitingForStore -[#lightsteelblue]-> processing: process
cancelledByStore -[#indianred]-> voidOrRefundFailure: voidOrRefundFailure
cancelledByClient -[#indianred]-> voidOrRefundFailure: voidOrRefundFailure
cancelledByCustomerSupport -[#indianred]-> voidOrRefundFailure: voidOrRefundFailure
changesRequestedByStore -[#tan]-> changesRejectedByClient: rejectChanges
changesRequestedByStore -[#slategray]-> changesAcceptedByClient: acceptChanges
changesRequestedByStore -[#tan]-> cancelledByCustomerSupport: cancelByCustomerSupport
changesRejectedByClient -[#indianred]-> voidOrRefundFailure: voidOrRefundFailure
changesAcceptedByClient -[#tan]-> cancelledByCustomerSupport: cancelByCustomerSupport
changesAcceptedByClient -[#lightsteelblue]-> processing: process
changesAcceptedByClient -[#tan]-> cancelledByStore: cancel
processing -[#tan]-> processingCancelledByStore: cancelProcessing
processing -[#slategray]-> processed: finishProcessing
processing -[#tan]-> cancelledByCustomerSupport: cancelByCustomerSupport
processingCancelledByStore -[#indianred]-> voidOrRefundFailure: voidOrRefundFailure
processed -[#indianred]-> captureFailure: captureFailure
processed -[#lightsteelblue,dashed]-> ready: ready
captureFailure -[#indianred]-> voidOrRefundFailure: voidOrRefundFailure
ready -[#mediumseagreen]-> completed: complete
ready -[#tan]-> readyCancelledByStore: cancelReady
ready -[#tan]-> cancelledByCustomerSupport: cancelByCustomerSupport
ready -[#slategray]-> waitingForDelivery: deliver
readyCancelledByStore -[#indianred]-> voidOrRefundFailure: voidOrRefundFailure
waitingForDelivery -[#mediumseagreen]-> completed: complete
waitingForDelivery -[#tan]-> waitingForDeliveryCancelledByStore: cancelWaitingForDelivery
waitingForDelivery -[#tan]-> cancelledByCustomerSupport: cancelByCustomerSupport
waitingForDeliveryCancelledByStore -[#indianred]-> voidOrRefundFailure: voidOrRefundFailure
completed -[#tan]-> completedCancelledByStore: cancelCompleted
completed -[#tan]-> cancelledByCustomerSupport: cancelByCustomerSupport
completedCancelledByStore -[#indianred]-> voidOrRefundFailure: voidOrRefundFailure

hide empty description
skinparam backgroundColor white
skinparam shadowing false
skinparam note {
  BackgroundColor white
  BorderColor slategray
  FontName monospaced
}
skinparam ArrowFontName monospaced
skinparam state {
  FontName monospaced
  AttributeFontName monospaced
  BackgroundColor white
  BorderColor slategray
  ArrowColor slategray
  ArrowThickness 2
  MessageAlignment left
  BackgroundColor<<danger>> Implementation
  BorderColor<<danger>> indianred
  BackgroundColor<<info>> Application
  BorderColor<<info>> skyblue
  BackgroundColor<<warning>> Strategy
  BorderColor<<warning>> tan
  BackgroundColor<<success>> Technology
  BorderColor<<success>> mediumseagreen
  BackgroundColor<<primary>> Motivation
  BorderColor<<primary>> lightsteelblue
}
@enduml
`;

    expect(plantUmlCode).toContain("@startuml");
    expect(plantUmlCode).toContain("title My machine");
    expect(plantUmlCode).toContain("created: ");
    expect(plantUmlCode).toContain("P:authorize");
    expect(plantUmlCode).toContain("T:authorizationFailure");
    expect(plantUmlCode).not.toContain("A:authorize");

    const svgResult = await documentate(plantUmlCode, { format: 'svg' });
    const svg = svgResult.svg!;

    expect(svg).toBeDefined();

    // expect that the file exists and is not empty
    expect(fs.existsSync(svg)).toBeTruthy();

    // Remove the file
    fs.unlinkSync(svg);
  });

  it("should generate esm code from a very high complexity machine", async () => {
    let myMachine = getMachine();
    const result = await documentate(myMachine, { format: 'mjs' });
    let esmCode = result.mjs;

    let expectedCode = `import { entry } from "x-robot";

/******************** MyMachineMachine Start ********************/

const getMyMachineContext = () => ({});

// Entries
const updateState = (context, payload) => {
  // TODO: Implement entry
  return {...context};
};

// Async entries
const update = async (context, payload) => {
  // TODO: Implement entry
};
const updateTransaction = async (context, payload) => {
  // TODO: Implement entry
};
const getClient = async (context, payload) => {
  // TODO: Implement entry
};
const getItemsAndTaxes = async (context, payload) => {
  // TODO: Implement entry
};
const getAmounts = async (context, payload) => {
  // TODO: Implement entry
};
const draft = async (context, payload) => {
  // TODO: Implement entry
};
const expireDraft = async (context, payload) => {
  // TODO: Implement entry
};
const getStore = async (context, payload) => {
  // TODO: Implement entry
};
const getRetailer = async (context, payload) => {
  // TODO: Implement entry
};
const setI18N = async (context, payload) => {
  // TODO: Implement entry
};
const validatePickupTime = async (context, payload) => {
  // TODO: Implement entry
};
const getCard = async (context, payload) => {
  // TODO: Implement entry
};
const create = async (context, payload) => {
  // TODO: Implement entry
};
const authorize = async (context, payload) => {
  // TODO: Implement entry
};
const createTransaction = async (context, payload) => {
  // TODO: Implement entry
};
const expire = async (context, payload) => {
  // TODO: Implement entry
};
const getTransaction = async (context, payload) => {
  // TODO: Implement entry
};
const voidOrRefundOrder = async (context, payload) => {
  // TODO: Implement entry
};
const sendNotificationToClient = async (context, payload) => {
  // TODO: Implement entry
};
const setError = async (context, payload) => {
  // TODO: Implement entry
};
const throwError = async (context, payload) => {
  // TODO: Implement entry
};
const setTimeoutTasks = async (context, payload) => {
  // TODO: Implement entry
};
const sendNotificationToStore = async (context, payload) => {
  // TODO: Implement entry
};
const setCancelledById = async (context, payload) => {
  // TODO: Implement entry
};
const decreaseSuccessfulStoreOrderCount = async (context, payload) => {
  // TODO: Implement entry
};
const capture = async (context, payload) => {
  // TODO: Implement entry
};
const increaseSuccessfulStoreOrderCount = async (context, payload) => {
  // TODO: Implement entry
};

export const MyMachineMachine = machine(
  "My machine",
  states(
    dangerState(
      "fatal",
      entry(update),
      entry(updateTransaction)
    ),
    state(
      "draft",
      entry(getClient),
      entry(getItemsAndTaxes),
      entry(getAmounts),
      entry(draft),
      transition("expiredDraft", "expiredDraft"),
      transition("create", "created")
    ),
    warningState(
      "expiredDraft",
      entry(getClient),
      entry(expireDraft)
    ),
    primaryState(
      "created",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(validatePickupTime),
      entry(getItemsAndTaxes),
      entry(getAmounts),
      entry(getCard),
      entry(create),
      entry(authorize, undefined, "authorizationFailure"),
      entry(createTransaction),
      entry(update),
      immediate("waitingForStore"),
      transition("expire", "expired")
    ),
    warningState(
      "expired",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(expire),
      entry(getTransaction),
      entry(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      entry(update),
      entry(updateTransaction),
      entry(sendNotificationToClient)
    ),
    dangerState(
      "authorizationFailure",
      entry(setError),
      entry(createTransaction),
      entry(update),
      entry(sendNotificationToClient),
      entry(throwError)
    ),
    primaryState(
      "waitingForStore",
      entry(sendNotificationToClient),
      entry(setTimeoutTasks),
      entry(update),
      transition("expire", "expired"),
      transition("cancel", "cancelledByStore"),
      transition("cancelByClient", "cancelledByClient"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
      transition("requestChanges", "changesRequestedByStore"),
      transition("process", "processing")
    ),
    warningState(
      "cancelledByStore",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(update),
      entry(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      entry(update),
      entry(updateTransaction),
      entry(sendNotificationToClient)
    ),
    warningState(
      "cancelledByClient",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(getTransaction),
      entry(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      entry(update),
      entry(sendNotificationToStore),
      entry(sendNotificationToClient)
    ),
    warningState(
      "cancelledByCustomerSupport",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(getTransaction),
      entry(setCancelledById),
      entry(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      entry(decreaseSuccessfulStoreOrderCount),
      entry(update),
      entry(updateTransaction),
      entry(sendNotificationToClient)
    ),
    dangerState(
      "voidOrRefundFailure",
      entry(setError),
      entry(updateTransaction),
      entry(update),
      entry(throwError)
    ),
    state(
      "changesRequestedByStore",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(getAmounts),
      entry(update),
      entry(sendNotificationToClient),
      transition("rejectChanges", "changesRejectedByClient"),
      transition("acceptChanges", "changesAcceptedByClient"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "changesRejectedByClient",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(getTransaction),
      entry(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      entry(update),
      entry(updateTransaction),
      entry(sendNotificationToClient),
      entry(sendNotificationToStore)
    ),
    state(
      "changesAcceptedByClient",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(update),
      entry(sendNotificationToStore),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
      transition("process", "processing"),
      transition("cancel", "cancelledByStore")
    ),
    primaryState(
      "processing",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(update),
      entry(sendNotificationToClient),
      transition("cancelProcessing", "processingCancelledByStore"),
      transition("finishProcessing", "processed"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "processingCancelledByStore",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(getTransaction),
      entry(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      entry(update),
      entry(updateTransaction),
      entry(sendNotificationToClient)
    ),
    state(
      "processed",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(getTransaction),
      entry(update),
      entry(capture, undefined, "captureFailure"),
      entry(updateTransaction),
      immediate("ready")
    ),
    dangerState(
      "captureFailure",
      entry(setError),
      entry(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      entry(update),
      entry(updateTransaction),
      entry(sendNotificationToClient),
      entry(sendNotificationToStore),
      entry(throwError)
    ),
    primaryState(
      "ready",
      entry(increaseSuccessfulStoreOrderCount),
      entry(update),
      entry(sendNotificationToClient),
      transition("complete", "completed"),
      transition("cancelReady", "readyCancelledByStore"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
      transition("deliver", "waitingForDelivery")
    ),
    warningState(
      "readyCancelledByStore",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(getTransaction),
      entry(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      entry(decreaseSuccessfulStoreOrderCount),
      entry(update),
      entry(updateTransaction),
      entry(sendNotificationToClient)
    ),
    state(
      "waitingForDelivery",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(getTransaction),
      entry(update),
      transition("complete", "completed"),
      transition("cancelWaitingForDelivery", "waitingForDeliveryCancelledByStore"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "waitingForDeliveryCancelledByStore",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(getTransaction),
      entry(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      entry(decreaseSuccessfulStoreOrderCount),
      entry(update),
      entry(updateTransaction),
      entry(sendNotificationToClient)
    ),
    successState(
      "completed",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(update),
      transition("cancelCompleted", "completedCancelledByStore"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "completedCancelledByStore",
      entry(getClient),
      entry(getStore),
      entry(getRetailer),
      entry(setI18N),
      entry(getCard),
      entry(getItemsAndTaxes),
      entry(getTransaction),
      entry(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      entry(decreaseSuccessfulStoreOrderCount),
      entry(update),
      entry(updateTransaction),
      entry(sendNotificationToClient)
    )
  ),
  context(getMyMachineContext),
  initial("draft")
);

/******************** MyMachineMachine End ********************/

export default { MyMachineMachine };
`;

    expect(esmCode).toContain('import { machine, states, initial, context, dangerState, entry');
    expect(esmCode).toContain('const authorize = (context, payload) => {');
    expect(esmCode).toContain('entry(authorize, undefined, "authorizationFailure")');
    expect(esmCode).toContain('entry(capture, undefined, "captureFailure")');
    expect(esmCode).toContain('entry(voidOrRefundOrder, undefined, "voidOrRefundFailure")');
    expect(esmCode).not.toMatch(/\baction\b/);
    expect(esmCode).not.toMatch(/\bproducer\b/);
  });
});
