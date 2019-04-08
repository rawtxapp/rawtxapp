import Micro from "./Micro";

let mockItems = {};

jest.mock("react-native", () => {
  // Mock AsyncStorage
  return {
    AsyncStorage: {
      setItem: jest.fn((item, value) => {
        return new Promise((resolve, reject) => {
          mockItems[item] = value;
          resolve(value);
        });
      }),
      multiSet: jest.fn((item, value) => {
        return new Promise((resolve, reject) => {
          mockItems[item] = value;
          resolve(value);
        });
      }),
      getItem: jest.fn((item, value) => {
        return new Promise((resolve, reject) => {
          resolve(mockItems[item]);
        });
      }),
      multiGet: jest.fn(item => {
        return new Promise((resolve, reject) => {
          resolve(mockItems[item]);
        });
      }),
      removeItem: jest.fn(item => {
        return new Promise((resolve, reject) => {
          resolve(delete mockItems[item]);
        });
      }),
      getAllKeys: jest.fn(mockItems => {
        return new Promise(resolve => {
          resolve(mockItems.keys());
        });
      })
    }
  };
});

beforeEach(() => {
  mockItems = {};
});

const testLapps = [
  {
    id: "rawtx-chat-localhost",
    icon: "https://rawtx.com/assets/logo.png",
    name: "rawtx chat",
    description: "a realtime chat application with lightning.",
    pubkey:
      "02e53fcf06df8242cb36d1cb802146895307aeeb20b31622672601a9efa6eaacc8",
    url: "http://localhost:3000"
  }
];

test("initial handshake", async () => {
  const m = new Micro();
  const sendMessage = jest.fn();
  m.setSendMessage(sendMessage);

  m.init();
  expect(sendMessage.mock.calls.length).toBe(1);
  expect(sendMessage.mock.calls[0][0]).toBe("initMicro");
  expect(m.initialized).toBe(false);

  m.onReceivedMessage("initMicroAck");
  expect(m.initialized).toBe(true);
});

test("app has no allowance without asking for it", async () => {
  const m = new Micro(testLapps[0]);
  expect(await m.getAppAllowanceFromDB()).toBe(0);
});

test("lapp can query (empty) allowance balance", async () => {
  expect.assertions(2);
  const m = new Micro();
  await m.onReceivedMessage("initMicroAck");
  const sendMessage = jest.fn();
  m.setSendMessage(sendMessage);

  await m.onReceivedMessage("getAppAllowance");
  expect(sendMessage.mock.calls.length).toBe(1);
  expect(sendMessage.mock.calls[0][0]).toBe("appAllowance:0");
});

test("if user doesn't want it, the app can't have any allowance", async () => {
  expect.assertions(5);
  const m = new Micro();
  await m.onReceivedMessage("initMicroAck");
  const sendMessage = jest.fn();
  m.setSendMessage(sendMessage);
  const showAllowanceAskToUser = jest.fn(_ => false);
  m.setShowAllowanceAskToUser(showAllowanceAskToUser);

  await m.onReceivedMessage("askForAllowance:10");
  expect(sendMessage.mock.calls.length).toBe(1);
  expect(sendMessage.mock.calls[0][0]).toBe("allowancerequest:refused");

  // Calling it multiple times won't help.
  await m.onReceivedMessage("askForAllowance:10");
  expect(sendMessage.mock.calls.length).toBe(2);
  expect(sendMessage.mock.calls[0][0]).toBe("allowancerequest:refused");

  expect(await m.getAppAllowanceFromDB()).toBe(0);
});

test("if user has no way of approving an allowance, any request is refused", async () => {
  expect.assertions(5);
  const m = new Micro();
  await m.onReceivedMessage("initMicroAck");
  const sendMessage = jest.fn();
  m.setSendMessage(sendMessage);
  // NOTICE that showAllowanceAskToUser method isn't set on Micro.

  await m.onReceivedMessage("askForAllowance:10");
  expect(sendMessage.mock.calls.length).toBe(1);
  expect(sendMessage.mock.calls[0][0]).toBe("allowancerequest:refused");

  // Calling it multiple times won't help.
  await m.onReceivedMessage("askForAllowance:10");
  expect(sendMessage.mock.calls.length).toBe(2);
  expect(sendMessage.mock.calls[0][0]).toBe("allowancerequest:refused");

  expect(await m.getAppAllowanceFromDB()).toBe(0);
});

test("if user approves, the lapp can have an allowance", async () => {
  expect.assertions(5);
  const m = new Micro(testLapps[0]);
  await m.onReceivedMessage("initMicroAck");
  const sendMessage = jest.fn();
  m.setSendMessage(sendMessage);
  const showAllowanceAskToUser = jest.fn(_ => true);
  m.setShowAllowanceAskToUser(showAllowanceAskToUser);

  await m.onReceivedMessage("askForAllowance:10");
  expect(sendMessage.mock.calls.length).toBe(1);
  expect(sendMessage.mock.calls[0][0]).toBe("allowancerequest:allowed");

  // Calling it multiple times won't help.
  await m.onReceivedMessage("askForAllowance:10");
  expect(sendMessage.mock.calls.length).toBe(2);
  expect(sendMessage.mock.calls[0][0]).toBe("allowancerequest:allowed");

  expect(await m.getAppAllowanceFromDB()).toBe(10);
});

test("lapp can't ask for more than 10k allowance", async () => {
  expect.assertions(5);
  const m = new Micro(testLapps[0]);
  await m.onReceivedMessage("initMicroAck");
  const sendMessage = jest.fn();
  m.setSendMessage(sendMessage);
  const showAllowanceAskToUser = jest.fn(_ => true);
  m.setShowAllowanceAskToUser(showAllowanceAskToUser);

  await m.onReceivedMessage("askForAllowance:10001");
  expect(sendMessage.mock.calls.length).toBe(1);
  expect(sendMessage.mock.calls[0][0]).toBe("allowancerequest:refused");

  // Calling it multiple times won't help.
  await m.onReceivedMessage("askForAllowance:10001");
  expect(sendMessage.mock.calls.length).toBe(2);
  expect(sendMessage.mock.calls[0][0]).toBe("allowancerequest:refused");

  expect(await m.getAppAllowanceFromDB()).toBe(0);
});

test("isMessageSane", async () => {
  expect(Micro.isMessageSane("")).toBe(true);
  expect(
    Micro.isMessageSane(
      "lightning:lnbc1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w"
    )
  ).toBe(true);
  expect(Micro.isMessageSane("initMicroAck")).toBe(true);
  expect(Micro.isMessageSane("askForAllowance:2000")).toBe(true);

  expect(Micro.isMessageSane("function(){eval('evil');}")).toBe(false);
  expect(Micro.isMessageSane(" ")).toBe(false);
  expect(Micro.isMessageSane("a\nb")).toBe(false);
});

test("micro won't allow paying to pubkeys other than lapp's pubkey", async () => {
  expect.assertions(2);
  const m = new Micro(testLapps[0], null, () => {
    return { destination: "anotherpubkey" };
  });
  const showAllowanceAskToUser = jest.fn(_ => true);
  m.setShowAllowanceAskToUser(showAllowanceAskToUser);
  const showPayInvoiceScreen = jest.fn(_ => true);
  m.setShowPayInvoiceScreen(showPayInvoiceScreen);

  const handled = await m.onReceivedMessage("lightning:someinvoice");
  expect(handled).toBe(false);
  expect(showPayInvoiceScreen.mock.calls.length).toBe(0);
});

test("micro will show a payment screen if lapp has no allowance", async () => {
  expect.assertions(2);
  const m = new Micro(testLapps[0], null, () => {
    return {
      destination:
        "02e53fcf06df8242cb36d1cb802146895307aeeb20b31622672601a9efa6eaacc8"
    };
  });
  const showPayInvoiceScreen = jest.fn(_ => true);
  m.setShowPayInvoiceScreen(showPayInvoiceScreen);

  const handled = await m.onReceivedMessage("lightning:someinvoice");
  expect(handled).toBe(false);
  expect(showPayInvoiceScreen.mock.calls.length).toBe(1);
});
