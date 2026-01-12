import { Config } from "effect";

export const serverPort = Config.number("PORT").pipe(Config.withDefault(3000));

export const databaseUrl = Config.string("DATABASE_URL").pipe(
	Config.withDefault(
		"postgresql://postgres:postgres@localhost:5432/rent_invoice",
	),
);
