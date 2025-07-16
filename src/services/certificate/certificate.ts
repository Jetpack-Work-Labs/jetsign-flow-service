import { Model } from "mongoose";
import { Icertificate } from "../../interfaces";
import { CertificateModel } from "../../model";

export class CertificateService {
  public model: Model<Icertificate>;

  constructor() {
    this.model = CertificateModel;
  }

  async findByCompanyId(
    account_id: number | string
  ): Promise<Icertificate | null> {
    const certificate = await this.model.findOne({ account_id }).exec();
    if (!certificate) {
      return null;
    }
    return certificate.toObject();
  }
  async createCertificate(payload: Icertificate): Promise<any> {
    return await this.model.create(payload);
  }
  async updateCertificates(payload: Partial<Icertificate>): Promise<any> {
    return await this.model.updateOne(
      { account_id: payload.accountId },
      {
        $set: { workerId: payload.workerId, tokenId: payload.tokenId },
      }
    );
  }
}
