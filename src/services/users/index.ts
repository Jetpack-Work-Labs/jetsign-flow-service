import { Model } from "mongoose";
import { IUser } from "../../interfaces";
import { UserModel } from "../../model";

export class UserService {
  public model: Model<IUser>;

  constructor() {
    this.model = UserModel;
  }

  async findUser(userId: string, accountId: string) {
    const user = await this.model
      .findOne({
        user_id: userId,
        account_id: accountId,
      })
      .exec();

    return user;
  }
}
