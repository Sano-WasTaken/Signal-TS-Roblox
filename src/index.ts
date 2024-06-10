class Signal<T extends (...args: any[]) => void> {
	callbacks: thread[]

	constructor() {
		this.callbacks = []
	}

	public Fire(...args: Parameters<T>) {
		this.callbacks.forEach((thread) => {
			coroutine.resume(thread, args)
		})
	}

    public Wait(): LuaTuple<Parameters<T>> {
        const mainThread = coroutine.running()

        this.Once(((...args: any[]) => {
            coroutine.resume(mainThread, args)
        }) as T)

        return coroutine.yield() as LuaTuple<Parameters<T>>
    }

	public Connect(callback: T) {
		const thread = coroutine.create(callback)

		const id = this.callbacks.push(thread)

		const connection = new Connection(thread, this, id)

		return connection
	}

	public DisconnectAll() {
		this.callbacks.clear()
	}

	public Once(callback: T) {
		const thread = coroutine.create((...args: Parameters<T>) => {
			coroutine.close(thread)
			callback(args)
		})

		const id = this.callbacks.push(thread)

		return new Connection(thread, this, id)
	}
}

class Connection {
	private thread: thread
	private signal: Signal<Callback>
	private id: number

	constructor(thread: thread, signal: Signal<Callback>, id: number) {
		this.thread = thread
		this.signal = signal
		this.id = id
	}

	public Disconnect() {
		this.signal.callbacks.remove(this.id)

		return this
	}

	public Reconnect() {
		const id = this.signal.callbacks.push(this.thread)

		this.id = id

		return this
	}
}

export = Signal