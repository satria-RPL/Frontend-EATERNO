export async function loginService(pin: string) {
  const dummyUser = {
    pin: "123456",
    name: "Neo One",
  };

  const isValid = pin === dummyUser.pin;

  if (!isValid) {
    return { success: false, message: "PIN salah" };
  }

  return {
    success: true,
    user: {
      name: dummyUser.name,
      pin: dummyUser.pin,
    },
  };
}
