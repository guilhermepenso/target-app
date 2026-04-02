import { router, useFocusEffect } from "expo-router";
import { Alert, StatusBar, View } from "react-native";
import { useCallback, useState } from "react";

import { useTargetDatabase } from "@/database/useTargetDatabase";
import {
  useTransactionsDatabase,
  Summary,
} from "../database/useTransactionsDatabase";

import { Button } from "@/components/Button";
import { HomeHeader, HomeHeaderProps } from "@/components/HomeHeader";
import { List } from "@/components/List";
import { Loading } from "@/components/Loading";
import { Target, TargetProps } from "@/components/Target";

import { numberToCurrency } from "@/utils/numberToCurrency";

export default function Index() {
  const [isFetching, setIsFetching] = useState(true);
  const [targets, setTargets] = useState<TargetProps[]>([]);
  const [summary, setSummary] = useState<HomeHeaderProps>({
    total: numberToCurrency(0),
    input: {
      label: "Entradas",
      value: numberToCurrency(0),
    },
    output: {
      label: "Saídas",
      value: numberToCurrency(0),
    },
  });

  const targetDatabase = useTargetDatabase();
  const transactionsDatabase = useTransactionsDatabase();

  async function fetchTargets(): Promise<TargetProps[]> {
    try {
      const response = await targetDatabase.listByClosestTarget();

      if (!response) throw new Error("Sem dados de metas");

      return (
        response.map((item) => ({
          id: String(item.id),
          name: item.name,
          current: numberToCurrency(item.current),
          percentage: item.percentage.toFixed(0) + "%",
          target: numberToCurrency(item.amount),
        })) ?? []
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as metas.");
      console.log(error);
      return [];
    }
  }

  async function fetchSummary(): Promise<HomeHeaderProps> {
    try {
      const response = await transactionsDatabase.summary();

      if (!response) throw new Error("Sem dados do sumário");

      return {
        total: numberToCurrency(response.input + response.output),
        input: {
          label: "Entradas",
          value: numberToCurrency(response.input),
        },
        output: {
          label: "Saídas",
          value: numberToCurrency(response.output),
        },
      };
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar o sumário.");
      console.log(error);
      return {
        total: numberToCurrency(0),
        input: {
          label: "Entradas",
          value: numberToCurrency(0),
        },
        output: {
          label: "Saídas",
          value: numberToCurrency(0),
        },
      };
    }
  }

  async function fetchData() {
    const targetDataPromise = fetchTargets();
    const summaryDataPromise = fetchSummary();

    const [targetData, summaryData] = await Promise.all([
      targetDataPromise,
      summaryDataPromise,
    ]);

    setTargets(targetData);
    setSummary(summaryData);
    setIsFetching(false);
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  if (isFetching) {
    return <Loading />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <HomeHeader data={summary} />
      <List
        title="Metas"
        data={targets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Target
            data={item}
            onPress={() => router.navigate(`/in-progress/${item.id}`)}
          />
        )}
        emptyMessage="Nenhuma meta. Toque em nova meta para criar."
        containerStyle={{ paddingHorizontal: 24 }}
      />
      <View style={{ padding: 24, paddingBottom: 32 }}>
        <Button title="Nova Meta" onPress={() => router.navigate("/target")} />
      </View>
    </View>
  );
}
