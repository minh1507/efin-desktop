export interface IResponse<T> {
    status: IStatus,
    message: IMessage,
    data: T,
    ui: IUi,
    trace: ITrace,
}

interface IStatus {
    code: number,
    success: boolean
}

interface IUi {
    flag: boolean
}

interface ITrace {
    id: string
}

interface IMessage{
    failed: string
}