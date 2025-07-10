export interface ISigner {
  emailColumnId?: string;
  userId?: number;
  label?: string;
  color?: string;
  type?: string;
  id?: string;
}

export interface ISignerSettings {
  signers?: ISigner[];
  isSigningOrderRequired?: boolean;
}
