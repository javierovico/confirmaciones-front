import {useContext, useEffect, useState} from "react";
import Usuario, {IUsuario, SubordinadosResponse} from "../../modelos/Usuario";
import {AuthContext} from "../../context/AuthProvider";
import axios from "axios";
import ResponseAPI from "../../modelos/ResponseAPI";
import {Divider, List, Typography} from "antd";


const useSubordinados = () => {
    const {user} = useContext(AuthContext);
    const [subordinados, setSubordinados] = useState<IUsuario[]>([])
    useEffect(() => {
        if (user?.id) {
            axios.get<ResponseAPI<SubordinadosResponse>>(new Usuario(user).getLinkSubordinados()).then(({data}) => {
                setSubordinados(data.data.subordinados)
            })
        } else {
            setSubordinados([])
        }
    }, [user])

    return {subordinados}
}

export default function Subordinados() {
    const {subordinados} = useSubordinados()
    return <>
        <Divider orientation="left">Lista de subordinados</Divider>
        <List
            header={<div>Header</div>}
            footer={<div>Footer</div>}
            bordered
            dataSource={subordinados}
            renderItem={item => (
                <List.Item>
                    <Typography.Text mark>[ITEM]</Typography.Text> {item.nombre}
                </List.Item>
            )}
        />
    </>
}
