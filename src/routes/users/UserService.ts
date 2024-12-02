import TruckBasePrismaClient from "../../global/PrismaClient";
import {PrismaClient, User} from "@prisma/client";
import {BadRequest, InternalServerError} from "http-errors";
import {PaginationModel} from "../../models/PaginationModel";
import yahooFinance from "yahoo-finance2";
import truckbasePrismaClient from "../../global/PrismaClient";

export class UserService {
    readonly prisma: PrismaClient;

    /**
     * Constructor for UserService
     * @param prisma Used only for Testing
     */
    constructor(prisma?: PrismaClient) {
        this.prisma = prisma ?? truckbasePrismaClient;
    }

    /**
     * Creates a user via PrismaClient
     * @param user Requested User
     */
    async createUser(user: User): Promise<User> {
        const watch_list = user.watch_list ?? [];

        return this.prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                watch_list: watch_list
            },
        });
    }

    /**
     * Retrieve all Users, with the User.id and User.name fields, to reduce size of payload
     * @param paginationToken Optional pagination token to retrieve users
     */
    async getUsers(paginationToken: PaginationModel): Promise<{id: number, name: string}[]> {
        return this.prisma.user.findMany({
            cursor: {
                id: paginationToken.startingCursor,
            },
            select: {
                id: true,
                name: true
            },
            take: paginationToken.pageSize,
            orderBy: {
                id: 'asc'
            }
        });
    }

    /**
     * Retrieve all User fields for a given id
     * @param id Unique id for requested User
     * @return Retrieved User object, as specified by idD
     */
    async getUser(id: number): Promise<User> {
        const user: User|null = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (user == null) {
            throw new BadRequest();
        } else  {
            return user;
        }
    }

    /**
     * Deletes User based on given id.
     * @param id Unique id for requested User
     * @return Deleted User object, as specified by id
     */
    async deleteUser(id: number): Promise<User> {
        const user: User = await this.getUser(id);

        if (user == null) {
            throw new BadRequest();
        }

        return this.prisma.user.delete({
            where: {
                id: Number(id),
            },
        });
    }

    /**
     * Update the user's WatchList with the requested stock ticker symbol
     * @param id Unique id for requested User
     * @param stockSymbol Requested Stock Symbol
     * @param updateType Add or remove stock symbol
     */
    async updateUserWatchList(id: number, stockSymbol: string, updateType: string): Promise<User> {
        const retrievedUser = await this.getUser(id);

        if (retrievedUser == null) {
            throw new BadRequest(`User Id ${id} does not exist`);
        }

        const isValidStockTicker: boolean = await this.validateStockTicker(stockSymbol);
        if (!isValidStockTicker) {
            throw new InternalServerError(`Invalid Stock Ticker ${stockSymbol}`);
        }

        let watch_list: string[] = retrievedUser.watch_list || [];
        if (updateType.toLowerCase() == "add" && !watch_list.includes(stockSymbol)) {
            watch_list.push(stockSymbol);
        } else {
            if (watch_list.includes(stockSymbol)) {
                watch_list = watch_list.filter(function (element: string) {
                    return element !== stockSymbol;
                });
            } else {
                throw new BadRequest(`Current User does not contain the stock ticker ${stockSymbol} in their watchList`);
            }
        }

        return this.prisma.user.update({
            where: { id: Number(id) || undefined },
            data: { watch_list: watch_list },
        });
    }

    /**
     * Evaluates and sets paginationModel
     * @param requestedPaginationModel Optional Pagination object specified by user
     */
    getPaginationModel(requestedPaginationModel?: any): PaginationModel {
        if (requestedPaginationModel == null || requestedPaginationModel.pageSize == null || requestedPaginationModel.startingCursor == null) {
            return {
                startingCursor: 1,
                pageSize: 100
            }
        } else {
            return {
                startingCursor: requestedPaginationModel.cursor,
                pageSize: requestedPaginationModel.pageSize
            }
        }
    }

    /**
     * Checks if Stock Symbol exists
     * @param stockTicker User-Requested Stock Symbol
     * @private
     */
    private async validateStockTicker(stockTicker: string) : Promise<boolean> {
        try {
            const price: any = await yahooFinance.quote(stockTicker);
            return !(!price || !price.regularMarketPrice);
        } catch (e) {
            return false;
        }
    }

}