import * as yup from "yup";

export const playerSchema = yup.object().shape({
  firstname: yup.string().required("Nome obrigatório"),
  lastname: yup.string().required("Sobrenome obrigatório"),
  birthDate: yup.string().required("Data de nascimento obrigatória"),
  rg: yup.string().optional(),
  cpf: yup.string().optional(),
  phoneNumber: yup.string().optional(),
  address: yup.string().optional(),
  addressNumber: yup.string().optional(),
  addressNeighborhood: yup.string().optional(),
  addressComplement: yup.string().optional(),
  postcode: yup.string().optional(),
  college: yup.string().optional(),
  collegeAddress: yup.string().optional(),
  collegeNeighborhood: yup.string().optional(),
  collegeComplement: yup.string().optional(),
  collegePostcode: yup.string().optional(),
  collegePhone: yup.string().optional(),
  collegeSeries: yup.string().optional(),
  collegeTime: yup.string().optional(),
  origin: yup.string().optional(),
  registrationId: yup.string().optional(),
  turma: yup.string().optional(),
  aulaGrupoId: yup.string().optional(),
  paymentPlan: yup
    .mixed<"PLANO_2X" | "PLANO_3X">()
    .oneOf(["PLANO_2X", "PLANO_3X"])
    .optional(),
});

export type PlayerFormData = yup.Asserts<typeof playerSchema>;
