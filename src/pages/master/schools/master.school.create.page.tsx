import { useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SchoolService } from "@/services/schollService/school.service";
import { AdminService } from "@/services/admin/admin.service";
import type { School } from "@/entities/school/scholl.entity";
import { toast } from "sonner";

type Step = "school" | "admin" | "done";

export default function MasterSchoolCreatePage() {
  const [step, setStep] = useState<Step>("school");
  const [loading, setLoading] = useState(false);
  const [createdSchool, setCreatedSchool] = useState<School | null>(null);

  const [schoolForm, setSchoolForm] = useState({
    name: "",
    cnpj: "",
    address: "",
    city: "",
  });
  const [logo, setLogo] = useState<File | null>(null);

  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    phone: "",
    document: "",
  });

  const resetAll = () => {
    setStep("school");
    setCreatedSchool(null);
    setSchoolForm({ name: "", cnpj: "", address: "", city: "" });
    setLogo(null);
    setAdminForm({
      email: "",
      password: "",
      firstname: "",
      lastname: "",
      phone: "",
      document: "",
    });
  };

  const handleCreateSchool = async () => {
    if (!schoolForm.name || !schoolForm.cnpj || !schoolForm.address || !schoolForm.city) {
      toast.error("Preencha todos os campos da escola");
      return;
    }
    if (!logo) {
      toast.error("A logo da escola é obrigatória");
      return;
    }

    try {
      setLoading(true);
      const school = await SchoolService.create({ ...schoolForm, logo });
      setCreatedSchool(school);
      toast.success("Escola criada com sucesso");
      setStep("admin");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível criar a escola");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!createdSchool) return;

    if (
      !adminForm.email ||
      !adminForm.password ||
      !adminForm.firstname ||
      !adminForm.lastname ||
      !adminForm.phone ||
      !adminForm.document
    ) {
      toast.error("Preencha todos os campos do administrador");
      return;
    }

    try {
      setLoading(true);
      await AdminService.create({
        ...adminForm,
        schoolId: createdSchool.id,
      });
      toast.success("Administrador criado com sucesso");
      setStep("done");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível criar o administrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">Cadastrar nova escola</Label>

      {step === "school" && (
        <section className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Nome da escola</Label>
              <Input
                value={schoolForm.name}
                onChange={(e) => setSchoolForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>CNPJ</Label>
              <Input
                value={schoolForm.cnpj}
                onChange={(e) => setSchoolForm((prev) => ({ ...prev, cnpj: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Endereço</Label>
              <Input
                value={schoolForm.address}
                onChange={(e) => setSchoolForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Cidade</Label>
              <Input
                value={schoolForm.city}
                onChange={(e) => setSchoolForm((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label>Logo da escola</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateSchool} disabled={loading}>
              {loading ? "Criando..." : "Criar escola e continuar"}
            </Button>
          </div>
        </section>
      )}

      {step === "admin" && createdSchool && (
        <section className="space-y-4 max-w-2xl">
          <p className="text-sm text-muted-foreground">
            Escola <strong>{createdSchool.name}</strong> criada. Agora cadastre o administrador
            responsável por ela.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Nome</Label>
              <Input
                value={adminForm.firstname}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, firstname: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Sobrenome</Label>
              <Input
                value={adminForm.lastname}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, lastname: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Senha provisória</Label>
              <Input
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Telefone</Label>
              <Input
                value={adminForm.phone}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>CPF</Label>
              <Input
                value={adminForm.document}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, document: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateAdmin} disabled={loading}>
              {loading ? "Criando..." : "Criar administrador"}
            </Button>
          </div>
        </section>
      )}

      {step === "done" && (
        <section className="space-y-4 max-w-2xl">
          <p className="text-sm text-muted-foreground">
            Escola e administrador criados com sucesso. O administrador já pode fazer login no
            Painel com o e-mail e a senha cadastrados.
          </p>
          <Button onClick={resetAll}>Cadastrar outra escola</Button>
        </section>
      )}
    </LayoutContent>
  );
}
