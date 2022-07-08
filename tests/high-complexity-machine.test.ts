import { Format, generateFromSerializedMachine } from "../lib/generate";
import { VISUALIZATION_LEVEL, createSvgFromPlantUmlCode, getPlantUmlCode } from "../lib/visualize";
import {
  action,
  context,
  dangerState,
  immediate,
  initial,
  machine,
  primaryState,
  producer,
  state,
  states,
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
    const updateStateProducer = producer(updateState);

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
    let actionGetClient = action(getClient, updateStateProducer);
    let actionGetItemsAndTaxes = action(getItemsAndTaxes, updateStateProducer);
    let actionGetAmounts = action(getAmounts, updateStateProducer);
    let actionDraft = action(draft, updateStateProducer);
    let actionExpireDraft = action(expireDraft, updateStateProducer);
    let actionGetStore = action(getStore, updateStateProducer);
    let actionGetRetailer = action(getRetailer, updateStateProducer);
    let actionSetI18N = action(setI18N, updateStateProducer);
    let actionValidatePickupTime = action(validatePickupTime, updateStateProducer);
    let actionGetCard = action(getCard, updateStateProducer);
    let actionCreate = action(create, updateStateProducer);
    let actionAuthorize = action(authorize, producer(updateState), producer(updateState, "authorizationFailure"));
    let actionCapture = action(capture, producer(updateState), producer(updateState, "captureFailure"));
    let actionVoidOrRefundOrder = action(voidOrRefundOrder, updateStateProducer, producer(updateState, "voidOrRefundFailure"));
    let actionUpdate = action(update, updateStateProducer);
    let actionSendNotificationToClient = action(sendNotificationToClient, updateStateProducer);
    let actionSendNotificationToStore = action(sendNotificationToStore, updateStateProducer);
    let actionIncreaseSuccessfulStoreOrderCount = action(increaseSuccessfulStoreOrderCount, updateStateProducer);
    let actionDecreaseSuccessfulStoreOrderCount = action(decreaseSuccessfulStoreOrderCount, updateStateProducer);
    let actionSetError = action(setError, updateStateProducer);
    let actionCreateTransaction = action(createTransaction, updateStateProducer);
    let actionThrowError = action(throwError);
    let actionSetTimeoutTasks = action(setTimeoutTasks, updateStateProducer);
    let actionGetTransaction = action(getTransaction, updateStateProducer);
    let actionExpire = action(expire, updateStateProducer);
    let actionUpdateTransaction = action(updateTransaction, updateStateProducer);
    let actionSetCancelledById = action(setCancelledById, updateStateProducer);

    let myMachine = machine(
      "My machine",
      states(
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
      ),
      context({}),
      initial("draft")
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

    expect(plantUmlCode).toEqual(expectedPlantUmlCode);

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

    let expectedCode = `import { machine, states, initial, context, dangerState, action, producer, state, transition, warningState, primaryState, immediate, successState } from "x-robot";

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
      action(update, producer(updateState)),
      action(updateTransaction, producer(updateState))
    ),
    state(
      "draft",
      action(getClient, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getAmounts, producer(updateState)),
      action(draft, producer(updateState)),
      transition("expiredDraft", "expiredDraft"),
      transition("create", "created")
    ),
    warningState(
      "expiredDraft",
      action(getClient, producer(updateState)),
      action(expireDraft, producer(updateState))
    ),
    primaryState(
      "created",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(validatePickupTime, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getAmounts, producer(updateState)),
      action(getCard, producer(updateState)),
      action(create, producer(updateState)),
      action(authorize, producer(updateState), producer(updateState, "authorizationFailure")),
      action(createTransaction, producer(updateState)),
      action(update, producer(updateState)),
      immediate("waitingForStore"),
      transition("expire", "expired")
    ),
    warningState(
      "expired",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(expire, producer(updateState)),
      action(getTransaction, producer(updateState)),
      action(voidOrRefundOrder, producer(updateState), producer(updateState, "voidOrRefundFailure")),
      action(update, producer(updateState)),
      action(updateTransaction, producer(updateState)),
      action(sendNotificationToClient, producer(updateState))
    ),
    dangerState(
      "authorizationFailure",
      action(setError, producer(updateState)),
      action(createTransaction, producer(updateState)),
      action(update, producer(updateState)),
      action(sendNotificationToClient, producer(updateState)),
      action(throwError)
    ),
    primaryState(
      "waitingForStore",
      action(sendNotificationToClient, producer(updateState)),
      action(setTimeoutTasks, producer(updateState)),
      action(update, producer(updateState)),
      transition("expire", "expired"),
      transition("cancel", "cancelledByStore"),
      transition("cancelByClient", "cancelledByClient"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
      transition("requestChanges", "changesRequestedByStore"),
      transition("process", "processing")
    ),
    warningState(
      "cancelledByStore",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(update, producer(updateState)),
      action(voidOrRefundOrder, producer(updateState), producer(updateState, "voidOrRefundFailure")),
      action(update, producer(updateState)),
      action(updateTransaction, producer(updateState)),
      action(sendNotificationToClient, producer(updateState))
    ),
    warningState(
      "cancelledByClient",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getTransaction, producer(updateState)),
      action(voidOrRefundOrder, producer(updateState), producer(updateState, "voidOrRefundFailure")),
      action(update, producer(updateState)),
      action(sendNotificationToStore, producer(updateState)),
      action(sendNotificationToClient, producer(updateState))
    ),
    warningState(
      "cancelledByCustomerSupport",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getTransaction, producer(updateState)),
      action(setCancelledById, producer(updateState)),
      action(voidOrRefundOrder, producer(updateState), producer(updateState, "voidOrRefundFailure")),
      action(decreaseSuccessfulStoreOrderCount, producer(updateState)),
      action(update, producer(updateState)),
      action(updateTransaction, producer(updateState)),
      action(sendNotificationToClient, producer(updateState))
    ),
    dangerState(
      "voidOrRefundFailure",
      action(setError, producer(updateState)),
      action(updateTransaction, producer(updateState)),
      action(update, producer(updateState)),
      action(throwError)
    ),
    state(
      "changesRequestedByStore",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getAmounts, producer(updateState)),
      action(update, producer(updateState)),
      action(sendNotificationToClient, producer(updateState)),
      transition("rejectChanges", "changesRejectedByClient"),
      transition("acceptChanges", "changesAcceptedByClient"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "changesRejectedByClient",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getTransaction, producer(updateState)),
      action(voidOrRefundOrder, producer(updateState), producer(updateState, "voidOrRefundFailure")),
      action(update, producer(updateState)),
      action(updateTransaction, producer(updateState)),
      action(sendNotificationToClient, producer(updateState)),
      action(sendNotificationToStore, producer(updateState))
    ),
    state(
      "changesAcceptedByClient",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(update, producer(updateState)),
      action(sendNotificationToStore, producer(updateState)),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
      transition("process", "processing"),
      transition("cancel", "cancelledByStore")
    ),
    primaryState(
      "processing",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(update, producer(updateState)),
      action(sendNotificationToClient, producer(updateState)),
      transition("cancelProcessing", "processingCancelledByStore"),
      transition("finishProcessing", "processed"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "processingCancelledByStore",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getTransaction, producer(updateState)),
      action(voidOrRefundOrder, producer(updateState), producer(updateState, "voidOrRefundFailure")),
      action(update, producer(updateState)),
      action(updateTransaction, producer(updateState)),
      action(sendNotificationToClient, producer(updateState))
    ),
    state(
      "processed",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getTransaction, producer(updateState)),
      action(update, producer(updateState)),
      action(capture, producer(updateState), producer(updateState, "captureFailure")),
      action(updateTransaction, producer(updateState)),
      immediate("ready")
    ),
    dangerState(
      "captureFailure",
      action(setError, producer(updateState)),
      action(voidOrRefundOrder, producer(updateState), producer(updateState, "voidOrRefundFailure")),
      action(update, producer(updateState)),
      action(updateTransaction, producer(updateState)),
      action(sendNotificationToClient, producer(updateState)),
      action(sendNotificationToStore, producer(updateState)),
      action(throwError)
    ),
    primaryState(
      "ready",
      action(increaseSuccessfulStoreOrderCount, producer(updateState)),
      action(update, producer(updateState)),
      action(sendNotificationToClient, producer(updateState)),
      transition("complete", "completed"),
      transition("cancelReady", "readyCancelledByStore"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
      transition("deliver", "waitingForDelivery")
    ),
    warningState(
      "readyCancelledByStore",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getTransaction, producer(updateState)),
      action(voidOrRefundOrder, producer(updateState), producer(updateState, "voidOrRefundFailure")),
      action(decreaseSuccessfulStoreOrderCount, producer(updateState)),
      action(update, producer(updateState)),
      action(updateTransaction, producer(updateState)),
      action(sendNotificationToClient, producer(updateState))
    ),
    state(
      "waitingForDelivery",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getTransaction, producer(updateState)),
      action(update, producer(updateState)),
      transition("complete", "completed"),
      transition("cancelWaitingForDelivery", "waitingForDeliveryCancelledByStore"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "waitingForDeliveryCancelledByStore",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getTransaction, producer(updateState)),
      action(voidOrRefundOrder, producer(updateState), producer(updateState, "voidOrRefundFailure")),
      action(decreaseSuccessfulStoreOrderCount, producer(updateState)),
      action(update, producer(updateState)),
      action(updateTransaction, producer(updateState)),
      action(sendNotificationToClient, producer(updateState))
    ),
    successState(
      "completed",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(update, producer(updateState)),
      transition("cancelCompleted", "completedCancelledByStore"),
      transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
    ),
    warningState(
      "completedCancelledByStore",
      action(getClient, producer(updateState)),
      action(getStore, producer(updateState)),
      action(getRetailer, producer(updateState)),
      action(setI18N, producer(updateState)),
      action(getCard, producer(updateState)),
      action(getItemsAndTaxes, producer(updateState)),
      action(getTransaction, producer(updateState)),
      action(voidOrRefundOrder, producer(updateState), producer(updateState, "voidOrRefundFailure")),
      action(decreaseSuccessfulStoreOrderCount, producer(updateState)),
      action(update, producer(updateState)),
      action(updateTransaction, producer(updateState)),
      action(sendNotificationToClient, producer(updateState))
    )
  ),
  context(getMyMachineContext),
  initial("draft")
);

/******************** MyMachineMachine End ********************/

export default { MyMachineMachine };
`;

    expect(esmCode).toEqual(expectedCode);
  });
});
