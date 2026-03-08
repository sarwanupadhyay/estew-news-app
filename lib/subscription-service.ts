import { db } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from "firebase/firestore"

// Subscribed user structure - comprehensive subscription info
export interface SubscribedUser {
  // User Info
  id: string
  email: string
  displayName: string
  
  // Subscription Details
  subscriptionType: "pro"
  subscriptionPlan: "monthly" | "yearly"
  subscriptionStatus: "active" | "cancelled" | "expired" | "paused"
  
  // Dates
  subscribedAt: Date
  renewalDate: Date
  lastPaymentDate: Date
  cancelledAt?: Date
  
  // Payment Gateway Info
  paymentGateway: "razorpay" | "stripe" | "paypal"
  paymentGatewayCustomerId?: string
  paymentGatewaySubscriptionId: string
  lastPaymentId: string
  
  // Billing
  amountPaid: number
  currency: string
  billingCycle: number // in months
  totalPayments: number
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// Billing entry for payment history
export interface BillingEntry {
  date: Date
  amount: number
  currency: string
  paymentId: string
  status: "success" | "failed" | "refunded"
  description: string
}

// User subscription view (for profile display)
export interface UserSubscription {
  plan: "free" | "pro"
  subscriptionStatus?: "active" | "cancelled" | "expired"
  subscriptionStartDate?: Date
  renewalDate?: Date
  razorpaySubscriptionId?: string
  daysRemaining?: number
}

// Create or update subscription after successful payment
export async function createSubscription(
  userId: string,
  razorpayPaymentId: string,
  razorpaySubscriptionId?: string,
  userEmail?: string,
  userName?: string
): Promise<void> {
  const startDate = new Date()
  const renewalDate = new Date()
  renewalDate.setMonth(renewalDate.getMonth() + 1) // Monthly subscription
  
  const subscriptionId = razorpaySubscriptionId || razorpayPaymentId

  // Get user document to fetch email and displayName
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  const userData = userSnap.data()
  
  // Get the actual email and name from user document or params
  const finalEmail = userEmail || userData?.email || ""
  const finalDisplayName = userName || userData?.displayName || userData?.name || ""
  
  await updateDoc(userRef, {
    plan: "pro",
    subscriptionStatus: "active",
    subscriptionStartDate: Timestamp.fromDate(startDate),
    renewalDate: Timestamp.fromDate(renewalDate),
    razorpaySubscriptionId: subscriptionId,
    updatedAt: serverTimestamp(),
  })

  // Create entry in subscribed_users collection (comprehensive subscription info)
  // Document ID is the userId, but displayName is prominently stored for easy viewing
  const subscribedUserRef = doc(db, "subscribed_users", userId)
  const subscribedUserData = {
    // User identification - displayName first for visibility in Firebase console
    displayName: finalDisplayName,
    email: finalEmail,
    userId: userId,
    
    subscriptionType: "pro",
    subscriptionPlan: "monthly",
    subscriptionStatus: "active",
    
    subscribedAt: Timestamp.fromDate(startDate),
    renewalDate: Timestamp.fromDate(renewalDate),
    lastPaymentDate: Timestamp.fromDate(startDate),
    
    paymentGateway: "razorpay",
    paymentGatewaySubscriptionId: subscriptionId,
    lastPaymentId: razorpayPaymentId,
    
    amountPaid: 599,
    currency: "INR",
    billingCycle: 1,
    totalPayments: 1,
    
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  
  await setDoc(subscribedUserRef, subscribedUserData, { merge: true })

  // Also create subscription record with billing history
  // Use displayName as document ID for easy identification in Firebase console
  // If displayName is empty, fallback to email prefix or userId
  const subscriptionDocId = finalDisplayName || finalEmail.split("@")[0] || userId
  const subscriptionRef = doc(db, "subscriptions", subscriptionDocId)
  await setDoc(subscriptionRef, {
    // User Info - prominently at the top for easy viewing
    displayName: finalDisplayName,
    email: finalEmail,
    userId: userId,
    
    // Subscription Details
    plan: "pro",
    status: "active",
    startDate: Timestamp.fromDate(startDate),
    renewalDate: Timestamp.fromDate(renewalDate),
    
    // Payment Info
    razorpaySubscriptionId: subscriptionId,
    razorpayPaymentId: razorpayPaymentId,
    
    // Billing History
    billingHistory: [{
      date: Timestamp.fromDate(startDate),
      amount: 599,
      currency: "INR",
      paymentId: razorpayPaymentId,
      status: "success",
      description: "Estew Pro - Monthly Subscription",
    }],
    
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// Get user subscription details
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    return { plan: "free" }
  }

  const data = userSnap.data()
  const plan = data.plan || "free"

  if (plan === "free") {
    return { plan: "free" }
  }

  const renewalDate = data.renewalDate instanceof Timestamp 
    ? data.renewalDate.toDate() 
    : data.renewalDate ? new Date(data.renewalDate) : undefined

  const daysRemaining = renewalDate 
    ? Math.max(0, Math.ceil((renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : undefined

  return {
    plan: "pro",
    subscriptionStatus: data.subscriptionStatus || "active",
    subscriptionStartDate: data.subscriptionStartDate instanceof Timestamp 
      ? data.subscriptionStartDate.toDate() 
      : data.subscriptionStartDate ? new Date(data.subscriptionStartDate) : undefined,
    renewalDate,
    razorpaySubscriptionId: data.razorpaySubscriptionId,
    daysRemaining,
  }
}

// Get full subscribed user details (admin view)
export async function getSubscribedUserDetails(userId: string): Promise<SubscribedUser | null> {
  const subscribedUserRef = doc(db, "subscribed_users", userId)
  const snap = await getDoc(subscribedUserRef)
  
  if (!snap.exists()) {
    return null
  }
  
  const data = snap.data()
  
  return {
    id: data.id,
    email: data.email,
    displayName: data.displayName,
    subscriptionType: data.subscriptionType,
    subscriptionPlan: data.subscriptionPlan,
    subscriptionStatus: data.subscriptionStatus,
    subscribedAt: data.subscribedAt instanceof Timestamp ? data.subscribedAt.toDate() : new Date(data.subscribedAt),
    renewalDate: data.renewalDate instanceof Timestamp ? data.renewalDate.toDate() : new Date(data.renewalDate),
    lastPaymentDate: data.lastPaymentDate instanceof Timestamp ? data.lastPaymentDate.toDate() : new Date(data.lastPaymentDate),
    cancelledAt: data.cancelledAt instanceof Timestamp ? data.cancelledAt.toDate() : data.cancelledAt ? new Date(data.cancelledAt) : undefined,
    paymentGateway: data.paymentGateway,
    paymentGatewayCustomerId: data.paymentGatewayCustomerId,
    paymentGatewaySubscriptionId: data.paymentGatewaySubscriptionId,
    lastPaymentId: data.lastPaymentId,
    amountPaid: data.amountPaid,
    currency: data.currency,
    billingCycle: data.billingCycle,
    totalPayments: data.totalPayments,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  }
}

// Get all subscribed users (admin function)
export async function getAllSubscribedUsers(): Promise<SubscribedUser[]> {
  const subscribedUsersRef = collection(db, "subscribed_users")
  const q = query(subscribedUsersRef, orderBy("subscribedAt", "desc"))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      subscriptionType: data.subscriptionType,
      subscriptionPlan: data.subscriptionPlan,
      subscriptionStatus: data.subscriptionStatus,
      subscribedAt: data.subscribedAt instanceof Timestamp ? data.subscribedAt.toDate() : new Date(data.subscribedAt),
      renewalDate: data.renewalDate instanceof Timestamp ? data.renewalDate.toDate() : new Date(data.renewalDate),
      lastPaymentDate: data.lastPaymentDate instanceof Timestamp ? data.lastPaymentDate.toDate() : new Date(data.lastPaymentDate),
      cancelledAt: data.cancelledAt instanceof Timestamp ? data.cancelledAt.toDate() : data.cancelledAt ? new Date(data.cancelledAt) : undefined,
      paymentGateway: data.paymentGateway,
      paymentGatewayCustomerId: data.paymentGatewayCustomerId,
      paymentGatewaySubscriptionId: data.paymentGatewaySubscriptionId,
      lastPaymentId: data.lastPaymentId,
      amountPaid: data.amountPaid,
      currency: data.currency,
      billingCycle: data.billingCycle,
      totalPayments: data.totalPayments,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
    }
  })
}

// Get active subscribers count
export async function getActiveSubscribersCount(): Promise<number> {
  const subscribedUsersRef = collection(db, "subscribed_users")
  const q = query(subscribedUsersRef, where("subscriptionStatus", "==", "active"))
  const snapshot = await getDocs(q)
  return snapshot.size
}

// Get billing history from subscription record
export async function getBillingHistory(subscriptionId: string): Promise<BillingEntry[]> {
  const subscriptionRef = doc(db, "subscriptions", subscriptionId)
  const snap = await getDoc(subscriptionRef)

  if (!snap.exists()) {
    return []
  }

  const data = snap.data()
  return (data.billingHistory || []).map((entry: {
    date: Timestamp | Date
    amount: number
    currency: string
    paymentId: string
    status: string
    description: string
  }) => ({
    date: entry.date instanceof Timestamp ? entry.date.toDate() : new Date(entry.date),
    amount: entry.amount,
    currency: entry.currency,
    paymentId: entry.paymentId,
    status: entry.status,
    description: entry.description,
  }))
}

// Cancel subscription
export async function cancelSubscription(userId: string, subscriptionId: string): Promise<void> {
  const now = new Date()
  
  // Update user document
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    subscriptionStatus: "cancelled",
    updatedAt: serverTimestamp(),
  })

  // Update subscribed_users collection
  const subscribedUserRef = doc(db, "subscribed_users", userId)
  await updateDoc(subscribedUserRef, {
    subscriptionStatus: "cancelled",
    cancelledAt: Timestamp.fromDate(now),
    updatedAt: serverTimestamp(),
  })

  // Update subscription record
  const subscriptionRef = doc(db, "subscriptions", subscriptionId)
  await updateDoc(subscriptionRef, {
    status: "cancelled",
    cancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// Renew subscription (after successful payment)
export async function renewSubscription(
  userId: string,
  subscriptionId: string,
  paymentId: string,
  amount: number = 599
): Promise<void> {
  const now = new Date()
  const renewalDate = new Date()
  renewalDate.setMonth(renewalDate.getMonth() + 1)
  
  // Update user document
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    subscriptionStatus: "active",
    renewalDate: Timestamp.fromDate(renewalDate),
    updatedAt: serverTimestamp(),
  })
  
  // Update subscribed_users
  const subscribedUserRef = doc(db, "subscribed_users", userId)
  const subscribedUserSnap = await getDoc(subscribedUserRef)
  const currentTotalPayments = subscribedUserSnap.data()?.totalPayments || 0
  
  await updateDoc(subscribedUserRef, {
    subscriptionStatus: "active",
    renewalDate: Timestamp.fromDate(renewalDate),
    lastPaymentDate: Timestamp.fromDate(now),
    lastPaymentId: paymentId,
    totalPayments: currentTotalPayments + 1,
    updatedAt: serverTimestamp(),
  })

  // Add billing entry
  const subscriptionRef = doc(db, "subscriptions", subscriptionId)
  await updateDoc(subscriptionRef, {
    status: "active",
    renewalDate: Timestamp.fromDate(renewalDate),
    billingHistory: arrayUnion({
      date: Timestamp.fromDate(now),
      amount,
      currency: "INR",
      paymentId,
      status: "success",
      description: "Estew Pro - Monthly Renewal",
    }),
    updatedAt: serverTimestamp(),
  })
}

// Check if subscription is active (not expired)
export function isSubscriptionActive(subscription: UserSubscription): boolean {
  if (subscription.plan === "free") return false
  if (subscription.subscriptionStatus !== "active") return false
  
  if (subscription.renewalDate) {
    return subscription.renewalDate.getTime() > Date.now()
  }
  
  return true
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}
