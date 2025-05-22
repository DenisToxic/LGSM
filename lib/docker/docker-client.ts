// Docker client for interacting with Docker API
import type { ServerFormData } from "@/components/server-creation-wizard"

// Docker container types
export type DockerContainerStatus = "created" | "running" | "paused" | "restarting" | "removing" | "exited" | "dead"

export type DockerContainer = {
  id: string
  name: string
  image: string
  status: DockerContainerStatus
  created: string
  ports: Record<string, string>
  volumes: string[]
  env: string[]
  labels: Record<string, string>
  stats: {
    cpu: number
    memory: {
      usage: number
      limit: number
      percent: number
    }
    network: {
      rx: number
      tx: number
    }
  }
}

export type DockerImage = {
  id: string
  repository: string
  tag: string
  created: string
  size: number
}

export type DockerVolume = {
  name: string
  driver: string
  mountpoint: string
  created: string
  size?: number
}

export type DockerNetwork = {
  id: string
  name: string
  driver: string
  created: string
  ipam: {
    subnet: string
    gateway: string
  }
}

// Docker container configuration
export type DockerContainerConfig = {
  name: string
  image: string
  ports: Record<string, string>
  volumes: string[]
  env: string[]
  restart: "no" | "always" | "on-failure" | "unless-stopped"
  labels: Record<string, string>
  resources: {
    cpuShares?: number
    memory?: number
    memorySwap?: number
  }
  networkMode?: string
}

// Game server Docker configurations
export const gameServerDockerConfigs: Record<string, Partial<DockerContainerConfig>> = {
  minecraft: {
    image: "itzg/minecraft-server:latest",
    ports: {
      "25565/tcp": "25565",
    },
    env: ["EULA=TRUE", "MEMORY=2G", "TYPE=VANILLA"],
    volumes: ["minecraft-data:/data"],
  },
  csgo: {
    image: "cm2network/csgo:latest",
    ports: {
      "27015/tcp": "27015",
      "27015/udp": "27015",
    },
    env: [
      "SRCDS_TOKEN=",
      "SRCDS_RCONPW=admin",
      "SRCDS_PW=",
      "SRCDS_PORT=27015",
      "SRCDS_TV_PORT=27020",
      "SRCDS_FPSMAX=300",
      "SRCDS_TICKRATE=128",
      "SRCDS_MAXPLAYERS=14",
    ],
    volumes: ["csgo-data:/home/steam/csgo-dedicated"],
  },
  valheim: {
    image: "lloesche/valheim-server:latest",
    ports: {
      "2456-2458/udp": "2456-2458",
    },
    env: ["SERVER_NAME=Valheim Server", "WORLD_NAME=Dedicated", "SERVER_PASS=secret", "SERVER_PUBLIC=true"],
    volumes: ["valheim-config:/config", "valheim-data:/opt/valheim"],
  },
  terraria: {
    image: "ryshe/terraria:latest",
    ports: {
      "7777/tcp": "7777",
    },
    env: ["WORLD_SIZE=3", "WORLD_NAME=Terraria", "WORLD_PASS=", "MAX_PLAYERS=8", "DIFFICULTY=0"],
    volumes: ["terraria-data:/root/.local/share/Terraria/Worlds"],
  },
  rust: {
    image: "didstopia/rust-server:latest",
    ports: {
      "28015/tcp": "28015",
      "28015/udp": "28015",
      "28016/tcp": "28016",
      "8080/tcp": "8080",
    },
    env: [
      "RUST_SERVER_NAME=Rust Server",
      "RUST_SERVER_DESCRIPTION=Powered by Docker",
      "RUST_SERVER_URL=https://example.com",
      "RUST_SERVER_IDENTITY=docker",
      "RUST_SERVER_SEED=12345",
      "RUST_SERVER_MAXPLAYERS=50",
      "RUST_START_MODE=0",
      "RUST_UPDATE_ON_BOOT=1",
    ],
    volumes: ["rust-data:/steamcmd/rust"],
  },
}

// Mock Docker client implementation
// In a real implementation, this would use the Docker API or a library like dockerode
export class DockerClient {
  private static instance: DockerClient
  private containers: DockerContainer[] = []
  private images: DockerImage[] = []
  private volumes: DockerVolume[] = []
  private networks: DockerNetwork[] = []

  private constructor() {
    // Initialize with some mock data
    this.images = [
      {
        id: "sha256:1234567890abcdef",
        repository: "itzg/minecraft-server",
        tag: "latest",
        created: new Date().toISOString(),
        size: 400000000,
      },
      {
        id: "sha256:abcdef1234567890",
        repository: "cm2network/csgo",
        tag: "latest",
        created: new Date().toISOString(),
        size: 2500000000,
      },
      {
        id: "sha256:9876543210abcdef",
        repository: "lloesche/valheim-server",
        tag: "latest",
        created: new Date().toISOString(),
        size: 1200000000,
      },
      {
        id: "sha256:fedcba0987654321",
        repository: "ryshe/terraria",
        tag: "latest",
        created: new Date().toISOString(),
        size: 300000000,
      },
      {
        id: "sha256:0123456789abcdef",
        repository: "didstopia/rust-server",
        tag: "latest",
        created: new Date().toISOString(),
        size: 3500000000,
      },
    ]
  }

  public static getInstance(): DockerClient {
    if (!DockerClient.instance) {
      DockerClient.instance = new DockerClient()
    }
    return DockerClient.instance
  }

  // Container operations
  async listContainers(): Promise<DockerContainer[]> {
    return this.containers
  }

  async getContainer(id: string): Promise<DockerContainer | null> {
    return this.containers.find((container) => container.id === id) || null
  }

  async createContainer(config: DockerContainerConfig): Promise<DockerContainer> {
    const id = `container-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const newContainer: DockerContainer = {
      id,
      name: config.name,
      image: config.image,
      status: "created",
      created: new Date().toISOString(),
      ports: config.ports || {},
      volumes: config.volumes || [],
      env: config.env || [],
      labels: config.labels || {},
      stats: {
        cpu: 0,
        memory: {
          usage: 0,
          limit: config.resources?.memory || 2147483648, // 2GB default
          percent: 0,
        },
        network: {
          rx: 0,
          tx: 0,
        },
      },
    }

    this.containers.push(newContainer)
    return newContainer
  }

  async startContainer(id: string): Promise<boolean> {
    const container = this.containers.find((c) => c.id === id)
    if (!container) return false

    container.status = "running"

    // Simulate container stats
    container.stats.cpu = Math.floor(Math.random() * 50) + 10
    container.stats.memory.usage = Math.floor((Math.random() * container.stats.memory.limit) / 2)
    container.stats.memory.percent = Math.floor((container.stats.memory.usage / container.stats.memory.limit) * 100)
    container.stats.network.rx = Math.floor(Math.random() * 10000000)
    container.stats.network.tx = Math.floor(Math.random() * 5000000)

    return true
  }

  async stopContainer(id: string): Promise<boolean> {
    const container = this.containers.find((c) => c.id === id)
    if (!container) return false

    container.status = "exited"

    // Reset stats
    container.stats.cpu = 0
    container.stats.memory.usage = 0
    container.stats.memory.percent = 0

    return true
  }

  async restartContainer(id: string): Promise<boolean> {
    const container = this.containers.find((c) => c.id === id)
    if (!container) return false

    container.status = "restarting"

    // Simulate restart
    setTimeout(() => {
      container.status = "running"
      container.stats.cpu = Math.floor(Math.random() * 50) + 10
      container.stats.memory.usage = Math.floor((Math.random() * container.stats.memory.limit) / 2)
      container.stats.memory.percent = Math.floor((container.stats.memory.usage / container.stats.memory.limit) * 100)
    }, 3000)

    return true
  }

  async removeContainer(id: string): Promise<boolean> {
    const containerIndex = this.containers.findIndex((c) => c.id === id)
    if (containerIndex === -1) return false

    this.containers.splice(containerIndex, 1)
    return true
  }

  async getContainerLogs(id: string): Promise<string[]> {
    const container = this.containers.find((c) => c.id === id)
    if (!container) return []

    // Simulate logs
    return [
      `[${new Date().toISOString()}] Container ${container.name} started`,
      `[${new Date().toISOString()}] Initializing server...`,
      `[${new Date().toISOString()}] Loading world data...`,
      `[${new Date().toISOString()}] Server started successfully`,
      `[${new Date().toISOString()}] Listening on ports: ${Object.values(container.ports).join(", ")}`,
    ]
  }

  // Image operations
  async listImages(): Promise<DockerImage[]> {
    return this.images
  }

  async pullImage(repository: string, tag = "latest"): Promise<DockerImage> {
    // Simulate image pull
    const id = `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    const newImage: DockerImage = {
      id,
      repository,
      tag,
      created: new Date().toISOString(),
      size: Math.floor(Math.random() * 1000000000) + 100000000,
    }

    this.images.push(newImage)
    return newImage
  }

  async removeImage(id: string): Promise<boolean> {
    const imageIndex = this.images.findIndex((img) => img.id === id)
    if (imageIndex === -1) return false

    this.images.splice(imageIndex, 1)
    return true
  }

  // Volume operations
  async listVolumes(): Promise<DockerVolume[]> {
    return this.volumes
  }

  async createVolume(name: string): Promise<DockerVolume> {
    const newVolume: DockerVolume = {
      name,
      driver: "local",
      mountpoint: `/var/lib/docker/volumes/${name}/_data`,
      created: new Date().toISOString(),
    }

    this.volumes.push(newVolume)
    return newVolume
  }

  async removeVolume(name: string): Promise<boolean> {
    const volumeIndex = this.volumes.findIndex((vol) => vol.name === name)
    if (volumeIndex === -1) return false

    this.volumes.splice(volumeIndex, 1)
    return true
  }

  // Network operations
  async listNetworks(): Promise<DockerNetwork[]> {
    return this.networks
  }

  // Convert server form data to Docker container config
  convertServerToDockerConfig(serverData: ServerFormData): DockerContainerConfig {
    const gameType = serverData.gameType as keyof typeof gameServerDockerConfigs
    const baseConfig = gameServerDockerConfigs[gameType] || {}

    // Create container name from server name
    const containerName = `gameserver-${serverData.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`

    // Merge base config with server-specific settings
    const config: DockerContainerConfig = {
      name: containerName,
      image: baseConfig.image || `${gameType}-server:latest`,
      ports: { ...baseConfig.ports },
      volumes: [...(baseConfig.volumes || [])],
      env: [...(baseConfig.env || [])],
      restart: "unless-stopped",
      labels: {
        app: "game-server-manager",
        game: gameType,
        "server-id": serverData.name,
      },
      resources: {
        cpuShares: (serverData.cpu * 1024) / 100, // Convert percentage to CPU shares
        memory: serverData.memory * 1024 * 1024 * 1024, // Convert GB to bytes
      },
    }

    // Add game-specific environment variables
    if (gameType === "minecraft") {
      config.env.push(`DIFFICULTY=${serverData.serverProperties.difficulty || "normal"}`)
      config.env.push(`WHITELIST=${serverData.serverProperties.whitelist || "false"}`)
      config.env.push(`OPS=${serverData.serverProperties.ops || ""}`)
      config.env.push(`MAX_PLAYERS=${serverData.maxPlayers}`)
      config.env.push(`MODE=${serverData.serverProperties.gamemode || "survival"}`)
      config.env.push(`MOTD=${serverData.description || serverData.name}`)
      config.env.push(`VERSION=${serverData.version}`)

      // Add mods if enabled
      if (serverData.enableMods && serverData.mods.length > 0) {
        config.env.push("TYPE=FORGE")
        config.env.push(`FORGEVERSION=${serverData.version}`)
      }
    }

    // Update port mapping based on server port
    if (config.ports && Object.keys(config.ports).length > 0) {
      const firstPortKey = Object.keys(config.ports)[0]
      config.ports[firstPortKey] = serverData.port.toString()
    }

    return config
  }
}

// Export singleton instance
export const dockerClient = DockerClient.getInstance()
