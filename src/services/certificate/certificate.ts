import { Model } from "mongoose";
import { Icertificate } from "../../interfaces";
import { CertificateModel } from "../../model";

export class CertificateService {
  public model: Model<Icertificate>;

  constructor() {
    this.model = CertificateModel;
  }

  async findByCompanyId(
    accountId: number | string
  ): Promise<Icertificate | null> {
    const certificate = await this.model.findOne({ accountId }).exec();
    if (!certificate) {
      return null;
    }
    return certificate.toObject();
  }
  async createCertificate(payload: Icertificate): Promise<any> {
    return await this.model.create(payload);
  }
  async updateCertificates(payload: Partial<Icertificate>): Promise<any> {
    return await this.model.updateMany(
      { account_id: payload.accountId },
      {
        $set: { workerId: payload.workerId, tokenId: payload.tokenId },
      }
    );
  }
}
