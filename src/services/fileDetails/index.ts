import { Model } from "mongoose";
import { IFileDetails } from "../../interfaces";
import { FileDetailsModel } from "../../model";

export class FileDetailsService {
  public model: Model<IFileDetails>;

  constructor() {
    this.model = FileDetailsModel;
  }

  async findFilesBuENvelopEID(envelopeId: string) {
    return await this.model.find({ envelopeId }).exec();
  }
}
