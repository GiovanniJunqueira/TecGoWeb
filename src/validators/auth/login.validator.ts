import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup.string().email().required("Email obrigatório"),
  password: yup.string().required("Senha obrigatória"),
});

export type LoginFormData = yup.Asserts<typeof loginSchema>;