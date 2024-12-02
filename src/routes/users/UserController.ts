import {Router} from "express";
import {UserService} from "./UserService";
import {PaginationModel} from "../../models/PaginationModel";
import {BadRequest, HttpError, InternalServerError} from "http-errors";

const userService = new UserService();
const httpRouter = Router();

/**
 * Get All {User.id, User.name} pairings from DB
 */
httpRouter.get('/users', async (req, res, next) => {
    const pagination: PaginationModel = userService.getPaginationModel(req.params);

    try {
        const users = await userService.getUsers(pagination);
        res.json(users);
    } catch (error) {
        if (error instanceof HttpError) {
            res.status(error.statusCode);
            res.json(error.message);
        } else {
            res.status(500);
            res.json(new InternalServerError());
        }
    }
});

/**
 *
 */
httpRouter.get('/user/:id', async (req, res, next) => {
    const { id } = req.params
    try {
        const user = await userService.getUser(Number.parseInt(id));
        res.json(user);
    } catch (error) {
        if (error instanceof BadRequest) {
            res.status(error.statusCode);
            res.json(`UserId ${id} does not exist in system.`);
        } else {
            next(error);
        }
    }
});

/**
 * Create User and add to DB
 */
httpRouter.post('/user', async (req, res, next) => {
   try {
       const response = await userService.createUser(req.body);
       res.json(response);
   } catch (error) {
        next(error);
    }
});

/**
 * Delete User from DB
 */
httpRouter.delete('/user/:id', async (req, res, next) => {
    const { id } = req.params
    try {
        const user = userService.deleteUser(Number.parseInt(id));
        res.json(user);
    } catch (error) {
        if (error instanceof BadRequest) {
            res.status(error.statusCode);
            res.json(`UserId ${id} does not exist in system.`);
        } else {
            next(error);
        }
    }

});

/**
 * Update User watch_list from DB
 */
httpRouter.put('/user/update_watch_list/:id', async (req, res, next) => {
    const id = Number.parseInt(req.params.id);
    const { ticker, update_type } = req.body

    try {
        const updatedUser = await userService.updateUserWatchList(id, ticker, update_type);
        res.json(updatedUser)
    } catch (error) {
        if (error instanceof BadRequest) {
            res.status(error.statusCode);
            res.json(error.message);
        } else {
           next(error);
        }
    }
});


export default httpRouter;