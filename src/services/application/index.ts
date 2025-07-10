import { Model } from "mongoose";
import { IApplication } from "../../interfaces";
import { ApplicationModel } from "../../model";

export class ApplicationService {
  public model: Model<IApplication>;

  constructor() {
    this.model = ApplicationModel;
  }

  async findCompany(accountId: number | string): Promise<IApplication | null> {
    const application = await this.model
      .findOne({
        account_id: accountId,
        type: "install",
      })
      .sort({ created_at: "desc" });

    return application?.toObject() || null;
  }
}
