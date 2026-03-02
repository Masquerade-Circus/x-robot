import { Format, generateFromSerializedMachine } from "../lib/generate";
import { VISUALIZATION_LEVEL, createSvgFromPlantUmlCode, getPlantUmlCode } from "../lib/visualize";
import {
  context,
  dangerState,
  immediate,
  init,
  initial,
  machine,
  pulse,
  primaryState,
  state,
  successState,
  transition,
  warningState,
} from "../lib";
import { describe, it } from "mocha";

import expect from "expect";
import fs from "fs";
import { serialize } from "../lib/serialize";
import { validate } from "../lib/validate";

describe("X-Robot", () => {
  function getMachine() {
    function updateState(context, payload) {
      return { ...context, ...payload };
    }

    // Actions
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
    let actionGetClient = pulse(getClient);
    let actionGetItemsAndTaxes = pulse(getItemsAndTaxes);
    let actionGetAmounts = pulse(getAmounts);
    let actionDraft = pulse(draft);
    let actionExpireDraft = pulse(expireDraft);
    let actionGetStore = pulse(getStore);
    let actionGetRetailer = pulse(getRetailer);
    let actionSetI18N = pulse(setI18N);
    let actionValidatePickupTime = pulse(validatePickupTime);
    let actionGetCard = pulse(getCard);
    let actionCreate = pulse(create);
    let actionAuthorize = pulse(authorize, undefined, "authorizationFailure");
    let actionCapture = pulse(capture, undefined, "captureFailure");
    let actionVoidOrRefundOrder = pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure");
    let actionUpdate = pulse(update);
    let actionSendNotificationToClient = pulse(sendNotificationToClient);
    let actionSendNotificationToStore = pulse(sendNotificationToStore);
    let actionIncreaseSuccessfulStoreOrderCount = pulse(increaseSuccessfulStoreOrderCount);
    let actionDecreaseSuccessfulStoreOrderCount = pulse(decreaseSuccessfulStoreOrderCount);
    let actionSetError = pulse(setError);
    let actionCreateTransaction = pulse(createTransaction);
    let actionThrowError = pulse(throwError);
    let actionSetTimeoutTasks = pulse(setTimeoutTasks);
    let actionGetTransaction = pulse(getTransaction);
    let actionExpire = pulse(expire);
    let actionUpdateTransaction = pulse(updateTransaction);
    let actionSetCancelledById = pulse(setCancelledById);

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

    let plantUmlCode = getPlantUmlCode(serialize(myMachine), VISUALIZATION_LEVEL.HIGH);

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

    const svg = await createSvgFromPlantUmlCode(plantUmlCode, { outDir: "./tmp", fileName: "test.svg" });

    expect(svg).toBeDefined();

    // expect that the file exists and is not empty
    expect(fs.existsSync(svg)).toBeTruthy();

    // Remove the file
    fs.unlinkSync(svg);
  });

  it("should generate esm code from a very high complexity machine", () => {
    let myMachine = getMachine();
    let serializedMachine = serialize(myMachine);
    let esmCode = generateFromSerializedMachine(serializedMachine, Format.ESM);

    let expectedCode = `import { machine, states, initial, context, dangerState, pulse, state, transition, warningState, primaryState, immediate, successState } from "x-robot";

/******************** MyMachineMachine Start ********************/

const getMyMachineContext = () => ({});

// Producers
const updateState = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};

// Actions
const update = async (context, payload) => {
  // TODO: Implement action
};
const updateTransaction = async (context, payload) => {
  // TODO: Implement action
};
const getClient = async (context, payload) => {
  // TODO: Implement action
};
const getItemsAndTaxes = async (context, payload) => {
  // TODO: Implement action
};
const getAmounts = async (context, payload) => {
  // TODO: Implement action
};
const draft = async (context, payload) => {
  // TODO: Implement action
};
const expireDraft = async (context, payload) => {
  // TODO: Implement action
};
const getStore = async (context, payload) => {
  // TODO: Implement action
};
const getRetailer = async (context, payload) => {
  // TODO: Implement action
};
const setI18N = async (context, payload) => {
  // TODO: Implement action
};
const validatePickupTime = async (context, payload) => {
  // TODO: Implement action
};
const getCard = async (context, payload) => {
  // TODO: Implement action
};
const create = async (context, payload) => {
  // TODO: Implement action
};
const authorize = async (context, payload) => {
  // TODO: Implement action
};
const createTransaction = async (context, payload) => {
  // TODO: Implement action
};
const expire = async (context, payload) => {
  // TODO: Implement action
};
const getTransaction = async (context, payload) => {
  // TODO: Implement action
};
const voidOrRefundOrder = async (context, payload) => {
  // TODO: Implement action
};
const sendNotificationToClient = async (context, payload) => {
  // TODO: Implement action
};
const setError = async (context, payload) => {
  // TODO: Implement action
};
const throwError = async (context, payload) => {
  // TODO: Implement action
};
const setTimeoutTasks = async (context, payload) => {
  // TODO: Implement action
};
const sendNotificationToStore = async (context, payload) => {
  // TODO: Implement action
};
const setCancelledById = async (context, payload) => {
  // TODO: Implement action
};
const decreaseSuccessfulStoreOrderCount = async (context, payload) => {
  // TODO: Implement action
};
const capture = async (context, payload) => {
  // TODO: Implement action
};
const increaseSuccessfulStoreOrderCount = async (context, payload) => {
  // TODO: Implement action
};

export const MyMachineMachine = machine(
  "My machine",
  states(
    dangerState(
      "fatal",
      pulse(update),
      pulse(updateTransaction)
    ),
    state(
      "draft",
      pulse(getClient),
      pulse(getItemsAndTaxes),
      pulse(getAmounts),
      pulse(draft),
      transition("expiredDraft", "expiredDraft"),
      transition("create", "created")
    ),
    warningState(
      "expiredDraft",
      pulse(getClient),
      pulse(expireDraft)
    ),
    primaryState(
      "created",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(validatePickupTime),
      pulse(getItemsAndTaxes),
      pulse(getAmounts),
      pulse(getCard),
      pulse(create),
      pulse(authorize, undefined, "authorizationFailure"),
      pulse(createTransaction),
      pulse(update),
      immediate("waitingForStore"),
      transition("expire", "expired")
    ),
    warningState(
      "expired",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(expire),
      pulse(getTransaction),
      pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      pulse(update),
      pulse(updateTransaction),
      pulse(sendNotificationToClient)
    ),
    dangerState(
      "authorizationFailure",
      pulse(setError),
      pulse(createTransaction),
      pulse(update),
      pulse(sendNotificationToClient),
      pulse(throwError)
    ),
    primaryState(
      "waitingForStore",
      pulse(sendNotificationToClient),
      pulse(setTimeoutTasks),
      pulse(update),
      transition("expire", "expired"),
      transition("cancel", "cancelledByStore"),
      transition("cancelByClient", "cancelledByClient"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
      transition("requestChanges", "changesRequestedByStore"),
      transition("process", "processing")
    ),
    warningState(
      "cancelledByStore",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(update),
      pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      pulse(update),
      pulse(updateTransaction),
      pulse(sendNotificationToClient)
    ),
    warningState(
      "cancelledByClient",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(getTransaction),
      pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      pulse(update),
      pulse(sendNotificationToStore),
      pulse(sendNotificationToClient)
    ),
    warningState(
      "cancelledByCustomerSupport",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(getTransaction),
      pulse(setCancelledById),
      pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      pulse(decreaseSuccessfulStoreOrderCount),
      pulse(update),
      pulse(updateTransaction),
      pulse(sendNotificationToClient)
    ),
    dangerState(
      "voidOrRefundFailure",
      pulse(setError),
      pulse(updateTransaction),
      pulse(update),
      pulse(throwError)
    ),
    state(
      "changesRequestedByStore",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(getAmounts),
      pulse(update),
      pulse(sendNotificationToClient),
      transition("rejectChanges", "changesRejectedByClient"),
      transition("acceptChanges", "changesAcceptedByClient"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "changesRejectedByClient",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(getTransaction),
      pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      pulse(update),
      pulse(updateTransaction),
      pulse(sendNotificationToClient),
      pulse(sendNotificationToStore)
    ),
    state(
      "changesAcceptedByClient",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(update),
      pulse(sendNotificationToStore),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
      transition("process", "processing"),
      transition("cancel", "cancelledByStore")
    ),
    primaryState(
      "processing",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(update),
      pulse(sendNotificationToClient),
      transition("cancelProcessing", "processingCancelledByStore"),
      transition("finishProcessing", "processed"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "processingCancelledByStore",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(getTransaction),
      pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      pulse(update),
      pulse(updateTransaction),
      pulse(sendNotificationToClient)
    ),
    state(
      "processed",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(getTransaction),
      pulse(update),
      pulse(capture, undefined, "captureFailure"),
      pulse(updateTransaction),
      immediate("ready")
    ),
    dangerState(
      "captureFailure",
      pulse(setError),
      pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      pulse(update),
      pulse(updateTransaction),
      pulse(sendNotificationToClient),
      pulse(sendNotificationToStore),
      pulse(throwError)
    ),
    primaryState(
      "ready",
      pulse(increaseSuccessfulStoreOrderCount),
      pulse(update),
      pulse(sendNotificationToClient),
      transition("complete", "completed"),
      transition("cancelReady", "readyCancelledByStore"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
      transition("deliver", "waitingForDelivery")
    ),
    warningState(
      "readyCancelledByStore",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(getTransaction),
      pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      pulse(decreaseSuccessfulStoreOrderCount),
      pulse(update),
      pulse(updateTransaction),
      pulse(sendNotificationToClient)
    ),
    state(
      "waitingForDelivery",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(getTransaction),
      pulse(update),
      transition("complete", "completed"),
      transition("cancelWaitingForDelivery", "waitingForDeliveryCancelledByStore"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "waitingForDeliveryCancelledByStore",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(getTransaction),
      pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      pulse(decreaseSuccessfulStoreOrderCount),
      pulse(update),
      pulse(updateTransaction),
      pulse(sendNotificationToClient)
    ),
    successState(
      "completed",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(update),
      transition("cancelCompleted", "completedCancelledByStore"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "completedCancelledByStore",
      pulse(getClient),
      pulse(getStore),
      pulse(getRetailer),
      pulse(setI18N),
      pulse(getCard),
      pulse(getItemsAndTaxes),
      pulse(getTransaction),
      pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure"),
      pulse(decreaseSuccessfulStoreOrderCount),
      pulse(update),
      pulse(updateTransaction),
      pulse(sendNotificationToClient)
    )
  ),
  context(getMyMachineContext),
  initial("draft")
);

/******************** MyMachineMachine End ********************/

export default { MyMachineMachine };
`;

    expect(esmCode).toContain('import { machine, states, initial, context, dangerState, pulse');
    expect(esmCode).toContain('const authorize = (context, payload) => {');
    expect(esmCode).toContain('pulse(authorize, undefined, "authorizationFailure")');
    expect(esmCode).toContain('pulse(capture, undefined, "captureFailure")');
    expect(esmCode).toContain('pulse(voidOrRefundOrder, undefined, "voidOrRefundFailure")');
    expect(esmCode).not.toMatch(/\baction\b/);
    expect(esmCode).not.toMatch(/\bproducer\b/);
  });
});
