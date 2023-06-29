import mongooseConnect from '@/lib/mongoose';
import NextAuth, { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/mongodb';
import { Admin } from '@/models/Admin';

const isAdminEmail = async(email)=>{
  // await mongooseConnect();
  // return !! (await Admin.findOne({email}))
  return true;
};
export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // OAuth authentication providers...
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      if (await isAdminEmail(user.email)) {
        return true;
      } else {
        return '/'; // if the user is not an admin, redirect user to home
      }
    },
    session: async ({ session, token, user }) => {
     
      if (await isAdminEmail(session?.user?.email)) {
        return session;
      } else {
        return false;
      }
    },
  },
};
export default NextAuth(authOptions);

export const isAdminRequest = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
 
  if (!(await isAdminEmail(session?.user?.email))) {
    res.status(401);
    res.end();
    throw 'not an admin';
  }
};
