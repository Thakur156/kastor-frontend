import { useState, useEffect } from "react";
import QueryEngine from "~/components/analyst/query-engine";
import { Button } from "~/components/ui/button";
import { getNamespaces } from "~/services/rest-services/catalog-api";
import { MetaFunction } from "@remix-run/react";
import { Pen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "~/lib/utils";
import NamespaceItem from "~/components/analyst/namespace-item";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import CatalogTables, { TabItem } from "~/components/analyst/catalog-tables";
import NamespaceItemLoader from "~/components/analyst/NamespaceTablesLoader";

export const meta: MetaFunction = () => {
	return [
		{
			title: "Query | Kastor",
		},
	];
};



function Query() {
	const [collapsed, setCollapsed] = useState(false);
	const [namespaces, setNamespaces] = useState<string[]>([]);
	const [loadingNamespaces, setLoadingNamespaces] = useState<boolean>(true);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [title, setTitle] = useState<string>("Untitled");
	const [tabsData, setTabsData] = useState<TabItem[]>([]);
	const [activeTab, setActiveTab] = useState<string>("query-engine");

	// Fetch namespaces on mount
	useEffect(() => {
		const fetchNamespaces = async () => {
			try {
				const result = await getNamespaces();
				setNamespaces(result?.namespaces || []);
			} catch (error) {
				console.error("Error fetching namespaces:", error);
			} finally {
				setLoadingNamespaces(false);
			}
		};
		fetchNamespaces();
	}, []);

	const handleRemoveTab = (tabTitle: string) => {
		setTabsData((prev) => {
			return prev.filter((tab) => tab.title !== tabTitle);
		});
		// set active tab to query engine if user try to close the active tab
		if (activeTab === tabTitle) setActiveTab("query-engine");
	};

	return (
		<div className="">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between">
				<div className="flex items-center space-x-4">
					<div className="text-2xl font-semibold text-Black">
						{isEditing ? (
							<div className="flex items-center gap-2">
								<input
									type="text"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="border-b-2 border-Blue/80 focus:outline-none"
								/>
								<Button className="md:h-10" onClick={() => setIsEditing(false)}>
									Save
								</Button>
							</div>
						) : (
							<div className="flex items-center">
								{title}
								<Pen
									size={20}
									className="cursor-pointer ml-2"
									onClick={() => setIsEditing(true)}
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="flex mt-5 gap-2 h-[calc(100vh-185px)]">
				<div
					className={cn(
						"relative overflow-y-auto pr-3",
						collapsed && "overflow-hidden"
					)}
				>
					<div
						className="h-10 w-10 grid place-items-center border border-Stroke rounded-full cursor-pointer"
						onClick={() => setCollapsed(!collapsed)}
						role="none"
					>
						{collapsed ? <ChevronRight /> : <ChevronLeft />}
					</div>
					<div
						className={cn(
							"w-[270px] sm:w-[345px] space-y-5 relative transition-[width] duration-300 my-5 overflow-auto",
							collapsed && "w-0 sm:w-0 overflow-hidden"
						)}
					>
						<h3 className="font-semibold text-xl">Namespaces and Tables</h3>
						{loadingNamespaces ? (
							[1, 2, 3, 4, 5, 6].map((_, index) => (
								<NamespaceItemLoader key={index} />
							))
						) : namespaces.length > 0 ? (
							namespaces.map((namespace) => (
								<NamespaceItem
									key={namespace}
									namespace={namespace}
									setTabsData={setTabsData}
								/>
							))
						) : (
							<div className="flex items-center justify-center mt-5">
								<p>No namespaces available for this catalog.</p>
							</div>
						)}
					</div>
				</div>

				<div className="flex-1 overflow-auto h-full pr-3">
					<Tabs
						defaultValue="query-engine"
						value={activeTab}
						className="flex flex-col h-full"
					>
						<div className="overflow-x-auto">
							<TabsList className="overflow-x-auto bg-Gray">
								<TabsTrigger
									value="query-engine"
									className="outline-none focus:outline-none"
									onClick={() => setActiveTab("query-engine")}
								>
									Query Engine
								</TabsTrigger>
								{tabsData.map((tab, index) => (
									<TabsTrigger
										key={index}
										value={tab.title}
										onClick={() => setActiveTab(tab.title)}
									>
										{tab.title}
										<X
											size={14}
											onClick={(e) => {
												handleRemoveTab(tab.title);
												e.stopPropagation();
											}}
											className="text-darkGray hover:text-Black cursor-pointer ml-1"
										/>
									</TabsTrigger>
								))}
							</TabsList>
						</div>
						<TabsContent value="query-engine"></TabsContent>
						{tabsData.map((tab, index) => (
							<TabsContent
								key={index}
								value={tab.title}
								className="flex-1 overflow-auto"
							>
								{activeTab === tab.title && (
									<CatalogTables
										namespace={tab.namespace}
										table={tab.table}
										setTabsData={setTabsData}
										defaultContent={tab.content}
									/>
								)}
							</TabsContent>
						))}
						<div
							className={cn(
								"flex-1 overflow-auto",
								activeTab === "query-engine" ? "block" : "hidden"
							)}
						>
							<QueryEngine activeTab={activeTab} title={title} />
						</div>
					</Tabs>
				</div>
			</div>
		</div>
	);
}

export default Query;
