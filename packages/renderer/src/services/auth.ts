import applicationJson from "./base/application-json";
import { AxiosError } from "axios";
import { toast } from "sonner"

export default class AuthService {
    static login = async (username: string, password: string) => {
        try {
            const response = await applicationJson.post("auth/jwt/login", {
                username,
                password,
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
