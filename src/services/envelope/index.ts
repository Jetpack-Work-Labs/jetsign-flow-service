import { Model, Types } from "mongoose";
import { IEnvelope } from "../../interfaces";
import { EnvelopeModel } from "../../model";

export class EnvelopeService {
  public model: Model<IEnvelope>;

  constructor() {
    this.model = EnvelopeModel;
  }

  async findOneById(id: string | Types.ObjectId): Promise<IEnvelope | null> {
    const envelope = await this.model
      .findOne({ _id: id, is_deleted: false })
      .exec();
    if (!envelope) {
      return null;
    }
    return envelope.toObject();
  }
}
