type RegisterArgs = {
  name: string;
  email: string;
  password: string;
  headers: {
    ip: string;
    userAgent: string;
  };
};

export class RegisterDto {
  public readonly name: string;
  public readonly email: string;
  public readonly password: string;
  public readonly headers: { ip: string; userAgent: string };

  constructor(args: RegisterArgs) {
    this.name = args.name;
    this.email = args.email;
    this.password = args.password;
    this.headers = args.headers;
  }
}
