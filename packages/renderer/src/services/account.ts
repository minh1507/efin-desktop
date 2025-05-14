import applicationJson from "./base/application-json";
import { AxiosError } from "axios";
import { toast } from "sonner"

export default class AccountService {
  static delete = async (username: string) => {
    try {
      const response = await applicationJson.post("/ca/jwt/account/delete", {
        account: username
      });

      toast.success("Thao tác thành công", {
        description: response.data['message']['success'],
      })

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          toast.error("Thao tác thất bại", {
            description: error.response?.data?.message['failed'],
          })
        }
      }

      throw new Error("An error occurred.");
    }
  };
}
