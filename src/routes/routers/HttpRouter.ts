import UserController from "../users/UserController";
import {Router} from "express";

const api = Router()
    .use(UserController);

export default api;