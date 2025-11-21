import { api } from "@/config";
import type { School } from "@/entities/school/scholl.entity";

export class SchoolService {
  
  public static async get(): Promise<School> {
    const { data } = await api.get<School>("/school");
    return data;
  }

}
