export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4400/";

interface LoginPayload {
  username: string;
  password: string;
}

interface SignupPayload {
  username: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
}

/* ================= LOGIN ================= */
export async function loginAdmin(payload: LoginPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}admins/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}

/* ================= SIGNUP ================= */
export async function signupAdmin(payload: SignupPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}admins/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Sign Up failed");

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}

/* ================= INSTANCE STATS ================= */
export async function instancesStatistics(token: string) {
  try {
    const res = await fetch(
      `${API_BASE_URL}dashboard/instanceStatistics`,
      {
        method: "POST", // changed to POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }), // ✅ token in body
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Fetching stats failed");

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}

export async function createInstance(
  token: string,
  instance_name: string
) {
  try {
    const res = await fetch(`${API_BASE_URL}instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instance_name,
        token,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Instance creation failed");

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}


export async function getAllInstances(adminToken: string) {
  try {
    const res = await fetch(`${API_BASE_URL}instance/list`, {
      method: "POST", // 👈 change to POST if backend expects body
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: adminToken,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Fetching instances failed");
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}

export async function getInstanceDetails(
  token: string,
  instance_id: string
) {
  try {
    const res = await fetch(
      `${API_BASE_URL}instance/details/${instance_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      body: JSON.stringify({
        token: token,
      }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error || "Fetching instance details failed"
      );
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}

// export async function startInstance(token:string, instance_id:string){
//   try{
//     const res = await fetch(
//     `${API_BASE_URL}instance/start/${instance_id}`,{ 
//       method: "POST", headers: { "Content-Type": "application/json", }, body: JSON.stringify({ token: token, }), } ); const data = await res.json();
//     if (!res.ok) {
//     throw new Error(
//     data.error || "Starting instance failed"
//     );
//     }return data; 
//     }
// catch(error:any)
//   { throw new Error(error.message || "Something went wrong");
//   }
// }
export async function startInstance(
  token: string,
  instance_name: string
) {
  try {
    const res = await fetch(
      `${API_BASE_URL}instance/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          instance_name,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Starting instance failed");
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}


export async function getQRpng(
  token: string,
  instance_id: string
) {
  try {
    const res = await fetch(
      `${API_BASE_URL}instance/qrpng/${instance_id}?token=${token}`
    );

    if (!res.ok) {
      throw new Error("Fetching QR failed");
    }

    // 🔥 VERY IMPORTANT: QR is an image, not JSON
    return await res.blob();

  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
}
