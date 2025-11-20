
import { dummyUsers } from "@/data/users";

export async function loginService(pin: string) {
  const user = dummyUsers.find((item) => item.pin === pin);

  if (!user) {
    return { success: false, message: "PIN salah" };
  }

  return {
    success: true,
    user: {
      name: user.name,
      pin: user.pin,
      role: user.role,
    },
  };
}
