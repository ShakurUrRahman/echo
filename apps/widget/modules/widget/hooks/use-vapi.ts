import Vapi from "@vapi-ai/web"
import { useEffect, useState } from "react"

interface TranscriptMessage {
  role: "user" | "assistant"
  text: string
}

export const useVapi = () => {
  const [vapi, setVapi] = useState<Vapi | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([])

  useEffect(() => {
    // Only for testing the Vapi API, otherwise customers will provide their own API keys
    const vapiInstance = new Vapi("d352cf1b-0575-4c8e-a43c-b5145ba4ce29")
    setVapi(vapiInstance)

    vapiInstance.on("call-start", () => {
      setIsConnected(true)
      setIsConnecting(false)
      setTranscript([])
    })

    vapiInstance.on("call-end", () => {
      setIsConnected(false)
      setIsConnecting(false)
      setIsSpeaking(false)
    })

    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true)
    })

    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false)
    })

    vapiInstance.on("error", (error) => {
      console.log(error, "VAPI_ERROR")
      setIsConnecting(false)
    })

    vapiInstance.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role === "user" ? "user" : "assistant",
            text: message.transcript,
          },
        ])
      }
    })

    return () => {
      vapiInstance?.stop()
    }
  }, [])

  const startCall = () => {
    setIsConnecting(true)

    if (vapi) {
      // Only for testing the Vapi API, otherwise customers will provide their own Assistant IDs
      vapi.start("dd30053f-dd15-4769-b59a-b2b3f19b99dc")
    }
  }

  const endCall = () => {
    if (vapi) {
      vapi.stop()
    }
  }

  return {
    isSpeaking,
    isConnecting,
    isConnected,
    transcript,
    startCall,
    endCall,
  }
}
