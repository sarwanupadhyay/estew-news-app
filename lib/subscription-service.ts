"use client"

import { db } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from "firebase/firestore"

// Subscription structure as per system prompt
export interface Subscription {
  userId: string
  plan: "pro"
  status: "active" | "cancelled" | "expired"
  startDate: Date
  renewalDate: Date
  razorpaySubscriptionId: string
  billingHistory: BillingEntry[]
}

export interface BillingEntry {
  date: Date
  amount: number
  currency: string
  paymentId: string
  status: "success" | "failed" | "refunded"
  description: string
}

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
  razorpaySubscriptionId?: string
): Promise<void> {
  const startDate = new Date()
  const renewalDate = new Date()
  renewalDate.setMonth(renewalDate.getMonth() + 1) // Monthly subscription

  // Update user document
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    plan: "pro",
    subscriptionStatus: "active",
    subscriptionStartDate: Timestamp.fromDate(startDate),
    renewalDate: Timestamp.fromDate(renewalDate),
    razorpaySubscriptionId: razorpaySubscriptionId || razorpayPaymentId,
    updatedAt: serverTimestamp(),
  })

  // Create subscription record
  const subscriptionRef = doc(db, "subscriptions", razorpaySubscriptionId || razorpayPaymentId)
  await setDoc(subscriptionRef, {
    userId,
    plan: "pro",
    status: "active",
    startDate: Timestamp.fromDate(startDate),
    renewalDate: Timestamp.fromDate(renewalDate),
    razorpaySubscriptionId: razorpaySubscriptionId || razorpayPaymentId,
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
  // Update user document
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    subscriptionStatus: "cancelled",
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

// Add billing entry
export async function addBillingEntry(
  subscriptionId: string,
  entry: Omit<BillingEntry, "date"> & { date?: Date }
): Promise<void> {
  const subscriptionRef = doc(db, "subscriptions", subscriptionId)
  await updateDoc(subscriptionRef, {
    billingHistory: arrayUnion({
      date: Timestamp.fromDate(entry.date || new Date()),
      amount: entry.amount,
      currency: entry.currency,
      paymentId: entry.paymentId,
      status: entry.status,
      description: entry.description,
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
