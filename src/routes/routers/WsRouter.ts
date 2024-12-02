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
    let delta: boolean = true;
    ws.on('message', async (msg: any) => {
        const stockTicker = decoder.decode(msg);
        let quote = await yahooFinance.quote(stockTicker);

        if (quote && quote.regularMarketPrice) {
            const sendData = async function () {
                if (!quote || !quote.regularMarketPrice) {
                    ws.close(500, "Yahoo Finance is down");
                    return;
                }
                let randomPrice = quote.regularMarketPrice + Math.random() / 10;
                let tick = {
                    price: randomPrice,
                    symbol: quote.symbol
                }
                ws.send(JSON.stringify(tick));
                quote = await yahooFinance.quote(stockTicker);
            };

            setInterval(sendData, 1000);
        } else {
            ws.send(JSON.stringify(new BadRequest(`Invalid Stock Ticker ${stockTicker}`)));
        }
    });

});


export default wsRouter;