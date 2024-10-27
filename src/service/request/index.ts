
export const requestEngine = async (endpoint: string, data: any) => {
    
    const response = await fetch(`${process.env.API_ENGINE_URL}${endpoint}`, {
        method: "post",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(data)
    })

    return await response.json()
}

