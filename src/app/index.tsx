import { Button } from "@/components/Button";
import HomeHeader from "@/components/HomeHeader";
import { List } from "@/components/List";
import { Target } from "@/components/Target";
import { router, useFocusEffect } from "expo-router";
import { Alert, StatusBar, View } from "react-native";

import { useTargetDatabase } from "../database/useTargetDatabase";
import { useCallback } from "react";

const summary = {
  total: "R$ 2.680,00",
  input: { label: "Entrada", value: "R$ 6,184.90" },
  output: { label: "Saída", value: "-R$ 883.65" },
};

const targets = [
  {
    id: "1",
    name: "Apple Watch",
    percentage: "50%",
    current: "R$ 580,00",
    target: "R$ 1.790,00",
  },
  {
    id: "2",
    name: "Comprar uma cadeira ergonômica",
    percentage: "75%",
    current: "R$ 900,00",
    target: "R$ 1.200,00",
  },
  {
    id: "3",
    name: "Fazer uma viagem para o Rio de Janeiro",
    percentage: "75%",
    current: "R$ 2.000,00",
    target: "R$ 3.000,00",
  },
];

export default function Index() {
  const targetDatabase = useTargetDatabase()

  async function fetchTargets() {
    try {
      const response = await targetDatabase.listBySavedValue()
      console.log(response)
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar  as metas.")
      console.log(error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchTargets()
    }, [])
  )

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content"/>
      <HomeHeader data={summary} />
      <List
        title="Metas"
        data={targets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Target data={item} onPress={() => router.navigate(`/in-progress/${item.id}`)} />}
        emptyMessage="Nenhuma meta. Toque em nova meta para criar."
        containerStyle={{ paddingHorizontal: 24 }}
      />
      <View style={{ padding: 24, paddingBottom: 32 }}>
        <Button title="Nova Meta" onPress={() => router.navigate("/target")} />
      </View>
    </View>
  );
}
