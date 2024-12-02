import {UserService} from "../../src/routes/users/UserService";
import {User} from "@prisma/client";
import {prismaMock} from "../global/MockPrismaSingleton";
import {equal} from "node:assert";
import {BadRequest, HttpError, InternalServerError} from "http-errors";
import yahooFinance from "yahoo-finance2";

// Prisma Mocking is accomplished following Prisma's instructions
// https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing#example-unit-tests

test('Test creating User', async function (){
    const testUser: User = {
        id: 99,
        name: 'Bob',
        email: 'foo@bar.com',
        watch_list: ["AAPL"]
    };

    prismaMock.user.create.mockResolvedValue(testUser);


    let testService: UserService = new UserService(prismaMock);
    let actualUser = await testService.createUser(testUser)
    equal(actualUser.name, testUser.name);
})

test('Test getting valid User', async function (){
    const testUser: User = {
        id: 99,
        name: 'Bob',
        email: 'foo@bar.com',
        watch_list: ["AAPL"]
    };

    prismaMock.user.findUnique.mockResolvedValue(testUser);

    let testService: UserService = new UserService(prismaMock);
    const actualUser = await testService.getUser(testUser.id);
    expect(actualUser.name).toEqual(testUser.name);
})

test('Test getting invalid/null User', async function (){
    const testUser: User = {
        id: 99,
        name: 'Bob',
        email: 'foo@bar.com',
        watch_list: ["AAPL"]
    };

    prismaMock.user.findUnique.mockResolvedValue(null);

    let testService: UserService = new UserService(prismaMock);
    try {
        await testService.getUser(testUser.id);
    } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.statusCode).toBe(BadRequest().statusCode);
    }
})

test('Test updating User Watchlist', async function (){
    const testUser: User = {
        id: 99,
        name: 'Bob',
        email: 'foo@bar.com',
        watch_list: ["AAPL"]
    };
    const requestedSymbol = "FOO";

    const updatedUser: User = {
        id: 99,
        name: 'Bob',
        email: 'foo@bar.com',
        watch_list: ["AAPL", requestedSymbol]
    };


    prismaMock.user.findUnique.mockResolvedValue(testUser);
    prismaMock.user.update.mockResolvedValue(updatedUser);

    const spyYahooFinanceQuote = jest.spyOn(yahooFinance, "quote");
    spyYahooFinanceQuote.mockResolvedValue({regularMarketPrice: 34});

    let testService: UserService = new UserService(prismaMock);
    const actualUser = await testService.updateUserWatchList(testUser.id, requestedSymbol, "add");
    expect(actualUser.name).toEqual(testUser.name);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: testUser.id },
        data: { watch_list: updatedUser.watch_list },
    });

})

test('Test updating User Watchlist with invalid Stock Symbol', async function (){
    const testUser: User = {
        id: 99,
        name: 'Bob',
        email: 'foo@bar.com',
        watch_list: ["AAPL"]
    };
    const requestedSymbol = "FOO";

    prismaMock.user.findUnique.mockResolvedValue(testUser);

    const spyYahooFinanceQuote = jest.spyOn(yahooFinance, "quote");
    // Return null from Yahoo Finance mock
    spyYahooFinanceQuote.mockResolvedValue(null);

    let testService: UserService = new UserService(prismaMock);
    try {
        await testService.updateUserWatchList(testUser.id, requestedSymbol, "add");
    } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.statusCode).toBe(InternalServerError().statusCode);
    }
})

test(`Test updating User Watchlist by removing symbol that's not in the watchlist`, async function (){
 
    const requestedSymbol = "FOO";
    const testUser: User = {
        id: 99,
        name: 'Bob',
        email: 'foo@bar.com',
        watch_list: [requestedSymbol]
    };

    prismaMock.user.findUnique.mockResolvedValue(testUser);

    const spyYahooFinanceQuote = jest.spyOn(yahooFinance, "quote");
    spyYahooFinanceQuote.mockResolvedValue({regularMarketPrice: 34});

    let testService: UserService = new UserService(prismaMock);

    try {
        await testService.updateUserWatchList(testUser.id, requestedSymbol, "remove");
    } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.statusCode).toBe(InternalServerError().statusCode);
    }
})