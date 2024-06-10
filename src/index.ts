class Signal<T extends (...args: any[]) => void> {
	callbacks: T[]

	constructor() {
		this.callbacks = []
	}

	public Fire(...args: Parameters<T>) {
		this.callbacks.forEach((callback) => {
			coroutine.wrap(callback)(...args)
		})
	}

    public Wait(): LuaTuple<Parameters<T>> {
        const mainThread = coroutine.running()

        this.Once(((...args: unknown[]) => {
            coroutine.resume(mainThread, ...args)
        }) as T)

        return coroutine.yield() as LuaTuple<Parameters<T>>
    }

	public Connect(callback: T) {
		const id = this.callbacks.push(callback)

		const connection = new Connection(this, id)

		return connection
	}

	public DisconnectAll() {
		this.callbacks.clear()
	}

	public Once(callback: T) {
		const connection = this.Connect(((...args: unknown[]) => {
			connection.Disconnect()
			callback(...args)
		}) as T)

		return connection
	}
}

class Connection {
	private signal: Signal<Callback>
	private id: number
	private callback: Callback

	constructor(signal: Signal<Callback>, id: number) {
		this.signal = signal
		this.id = id
		this.callback = signal.callbacks[id]
	}

	public Disconnect() {
		this.signal.callbacks.remove(this.id)

		return this
	}

	public Reconnect() {
		const id = this.signal.callbacks.push(this.callback)
		this.id = id

		return this
	}
}

export = Signal