import {Router} from "websocket-express";
import yahooFinance from "yahoo-finance2";
import {BadRequest} from "http-errors";


const wsRouter = new Router();

/**
 * WebSocket for Stock Ticker
 */
wsRouter.ws('/ticker', async (req, res, next) => {
    const ws = await res.accept();
    const decoder = new TextDecoder();
    ws.on('message', async (msg: any) => {
        const stockTicker = decoder.decode(msg);
        let quote = await getStockQuote(stockTicker);

        if (quote && quote.regularMarketPrice) {
            const sendData = async function () {
                let randomPrice = quote.regularMarketPrice * Math.random();
                let tick = {
                    price: randomPrice,
                    symbol: quote.symbol
                }
                ws.send(JSON.stringify(tick));
                quote = await getStockQuote(stockTicker, quote.regularMarketPrice);
            };

            setInterval(sendData, 1000);
        } else {
            ws.send(JSON.stringify(new BadRequest(`Invalid Stock Ticker ${stockTicker}`)));
        }
    });

});

async function getStockQuote(stockTicker: string, lastPrice?: number): Promise<any> {
    // Returns random stock price because I got throttled by Yahoo
    return {
        symbol: stockTicker,
        regularMarketPrice: (lastPrice) ? lastPrice * Math.random(): 99 * Math.random()
    }
}

export default wsRouter;