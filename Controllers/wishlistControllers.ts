import Wishlist from "../Models/wishListModel.js";

import { Request,Response } from "express";

class WishlistControllers {

  static addToWishlist = async (req: Request, res: Response) => {
    console.log('Request body:', req.body);

    const {userId,productId}=req.body;
    console.log(`Adding product to wishlist for user: ${userId}`);

    try{
        const wishlist=await Wishlist.findOneAndUpdate(
            {user:userId},
            {$addToSet:{products:productId}},
            {new:true,upsert:true}
        )
        console.log('Wishlist after update:', wishlist);

        return res.status(200).json(wishlist)
    }catch(error:any){
        return res.status(500).json({error:error.message})
    }
  };

  static removeFromWishlist=async (req:Request,res:Response)=>{
    const { userId, productId } = req.body;

    try {
      const wishlist = await Wishlist.findOneAndUpdate(
        { user: userId },
        { $pull: { products: productId } },
        { new: true }
      );
      return res.status(200).json(wishlist);
    } catch (error:any) {
      return res.status(500).json({ error: error });
    }
  }

  static getUserWishlist = async (req: Request, res: Response) => {
    const userId = req.params.userId;
    console.log(`Fetching wishlist for user: ${userId}`);
   
    try {
       const wishlist = await Wishlist.findOne({ user: userId }).populate({
        path: "products",
        populate: {
          path: "productCollection", // Assuming 'productCollection' is the field in your Product schema that references the Collection model
        },
     });
       console.log('Fetched wishlist:', wishlist);
       return res.status(200).json({ "wishlist": wishlist });
    } catch (error: any) {
       console.error('Error fetching wishlist:', error.message);
       return res.status(500).json({
         success: false,
         message: "Failed to get wishlist",
         status: 500,
         data: null,
       });
    }
   }
   
}

export default WishlistControllers