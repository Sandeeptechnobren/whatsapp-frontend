// "use server"

import { get } from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4400/";

interface LoginPayload {
  username: string;
  password: string;
}
interface SignupPayload{
    username:string;
    name:string;
    email:string;
    phone:string;
    password:string;
    address:string;

}

export async function loginAdmin(payload: LoginPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}admins/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }
    return data;
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Something went wrong");
    }
    throw new Error("Something went wrong");
  }
}

export async function signupAdmin(payload: SignupPayload){
    try{
        const res = await fetch(`${API_BASE_URL}admins/create`,{
            method:"POST",
            headers: {"Content-Type":"application/json"},
            body:JSON.stringify(payload),
        });
        const data=await res.json();
        if(!res.ok){
            throw new Error(data.error||"Sign Up failed");
        }
        return data;
    }
  catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Something went wrong");
    }
    throw new Error("Something went wrong");
  }

}

export async function instancesStatistics(token:string){
  try{
    const res=await fetch(`${API_BASE_URL}dashboard/instanceStatistics`,{
        method:"POST",
        headers: {
          "Content-Type":"application/json",
          "Authorization": token,
        },
    });
    const data=await res.json();
    if(!res.ok){
        throw new Error(data.error||"Sign Up failed");
    }
    return data;
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Something went wrong");
    }
    throw new Error("Something went wrong");
  }

}

export async function createInstance(token: string, instance_name: string) {
  try {
    const res = await fetch(`${API_BASE_URL}instance/create`, { // correct endpoint!
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify({ instance_name }), // send as an object!
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Instance creation failed");
    }
    // Assume the API returns { instance_name: "..." }
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Something went wrong");
    }
    throw new Error("Something went wrong");
  }
}

export async function getAllInstances(token:string){
  try{
    const res=await fetch(`${API_BASE_URL}instance/list`,{
        method:"GET",
        headers:{
            "Content-Type":"application/json",
            "Authorization":token,
        },  
    });
    const data=await res.json();
    if(!res.ok){
        throw new Error(data.error||"Fetching instances failed");
    }
    return data;
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Something went wrong");
    }
    throw new Error("Something went wrong");
  }
}