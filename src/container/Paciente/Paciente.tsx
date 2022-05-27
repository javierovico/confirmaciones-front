import React, {useEffect, useMemo, useState} from "react";
import {useParams, useSearchParams} from "react-router-dom";
import {IContact, IDeal, URL_GET_CONTACT, URL_GET_DEAL} from "../../modelos/Paciente";
import axios from "axios";
import ResponseAPI from "../../modelos/ResponseAPI";
import openNotification, {getTitleFromException} from "../../components/UI/Antd/Notification";
import {Result, Spin, Table, Tag, Space} from "antd";
import {ColumnsType} from "antd/es/table";

const usePaciente = (contactId: string, token: string) => {
    const [contact, setContact] = useState<IContact|undefined>()
    const [deals, setDeals] = useState<IDeal[]>([])
    const [isErrorContact, setIsErrorContact] = useState(false)
    const [isErrorDeal, setIsErrorDeals] = useState(false)
    const isError = useMemo(()=> isErrorDeal || isErrorContact, [isErrorContact, isErrorDeal])
    const [loadingContact, setLoadingContact] = useState<boolean>(true)
    const [loadingDeals, setLoadingDeals] = useState<boolean>(true)
    const loading = useMemo(()=>loadingContact || loadingDeals,[loadingContact, loadingDeals])
    const [errorMessage, setErrorMessage] = useState<string|null>(null)
    useEffect(()=>{
        setLoadingContact(true)
        setIsErrorContact(false)
        setErrorMessage(null)
        if (contactId && token) {
            axios.get<IContact>(URL_GET_CONTACT + '/' + contactId,{
                params:{
                    'tokenMas': token,
                }
            })
                .then(({data}) => {
                    setContact(data)
                })
                .catch(e=> {
                    openNotification(e)
                    setErrorMessage(getTitleFromException(e))
                    setContact(undefined)
                    setIsErrorContact(true)
                })
                .finally(()=>setLoadingContact(false))
        } else {
            setContact(undefined)
            setIsErrorContact(true)
            if (!contactId) {
                setErrorMessage("Falta el parametro de contactId")
            } else if (!token) {
                setErrorMessage("Falta el parametro de token")
            }
            setLoadingContact(false)
        }
    },[contactId, token])
    useEffect(()=>{
        setLoadingDeals(true)
        setIsErrorDeals(false)
        if (contactId && token) {
            axios.get<IDeal[]>(URL_GET_CONTACT + '/' + contactId + URL_GET_DEAL,{
                params:{
                    'tokenMas': token,
                }
            })
                .then(({data}) => {
                    setDeals(data.filter(d =>d.customData.fechaRecordatorio))
                })
                .catch(e=> {
                    setDeals([])
                    setIsErrorDeals(true)
                    openNotification(e)
                })
                .finally(()=> setLoadingDeals(false))
        } else {
            setDeals([])
            setIsErrorDeals(true)
            setLoadingDeals(false)
        }
    },[contactId, token])
    return {
        contact,
        deals,
        loadingContact,
        loadingDeals,
        isError,
        errorMessage
    }
}

export default function Paciente(){
    const params = useParams()
    const contactId: string = params.contactId || ''
    const [searchParams] = useSearchParams();
    const token: string = searchParams.get('token') || '';
    const {contact, deals, loadingContact, loadingDeals, isError, errorMessage} = usePaciente(contactId, token)

    const columns: ColumnsType<IDeal> = [
        {
            title: 'Nombre',
            dataIndex: 'name',
            key: 'name',
            render: _ => contact?.firstname + ' ' + contact?.lastname,
        },
        {
            title: 'Fecha Cita',
            dataIndex: 'age',
            key: 'age',
            render: (_, deal) => {
                return deal.customData.fechaRecordatorio || ''
            }
        },
        {
            title: 'Estado',
            dataIndex: 'stageDescription',
            key: 'stageDescription',
            render: (_, deal) => {
                const color = deal.stageDescription === 'Pendiente'?'volcano':'red'
                return <Tag color={color}>
                    {deal.stageDescription}
                </Tag>
            }
        },
        {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            render: (_, deal ) => (
                <>
                    {['loser','otro'].map(tag => {
                        let color = tag.length > 5 ? 'geekblue' : 'green';
                        if (tag === 'loser') {
                            color = 'volcano';
                        }
                        return (
                            <Tag color={color} key={tag}>
                                {tag.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a>Invite SI</a>
                    <a>Delete</a>
                </Space>
            ),
        },
    ];

    if (isError) {
        return <Result
            status="error"
            title={errorMessage || "Error realizando la operacion, revise el log"}
        />
    } else if (!loadingContact && contact) {
        return <>
            <h1>Citas a confirmar de {contact.firstname + ' ' + contact.lastname}</h1>
            <Table columns={columns} dataSource={deals} loading={loadingDeals} />
        </>
    } else {
        return <Spin/>
    }

}
