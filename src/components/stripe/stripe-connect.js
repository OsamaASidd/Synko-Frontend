"use client";
import Modal from "../modal";
import React, { useContext, useEffect, useState } from "react";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { loadConnectAndInitialize } from "@stripe/connect-js/pure";
import { stripe_public_key } from "@/utils/api";
import { GlobalContext } from "@/context";
import { postRequest } from "@/utils/apiFunctions";
import { getErrorMessageFromResponse } from "@/utils/helper";
export default function StripeConnect({ modelIsOpen, setIsModalOpen }) {
  //   const [modelIsOpen, setIsModalOpen] = useState(false); // Added state for modal

  const [connectInstance, setConnectInstance] = useState(null);
  const [secret, setSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const { merchant } = useContext(GlobalContext);

  useEffect(() => {
    if (merchant?.id) {
      setLoading(true);
      postRequest(`/stripe/${merchant?.id}/account_session`)
        .then((res) => {
          if (res?.data?.session?.client_secret) {
            setSecret(() => res.data.session.client_secret); // Ensure it's a function
          } else {
            console.error("Client secret not found in response", res);
          }
        })
        .catch((err) => {
          getErrorMessageFromResponse(err);
        })
        .finally(() => setLoading(false));
    }
  }, [merchant]);

  useEffect(() => {
    if (secret) {
      const initializeConnectInstance = async () => {
        try {
          const instance = await loadConnectAndInitialize({
            publishableKey: stripe_public_key,
            fetchClientSecret: async () => secret, // ✅ Wrap in a function
            appearance: {
              variables: {
                colorPrimary: "#03a4f2",
                buttonPrimaryColorText: "#ffffff",
              },
            },
          });
          setConnectInstance(instance);
        } catch (error) {
          console.error("Error initializing Stripe Connect:", error);
        }
      };
      initializeConnectInstance();
    }
  }, [secret]);

  return (
    <>
      <Modal
        isOpen={modelIsOpen}
        heading={"Stripe Connect"}
        onClose={() => {
          setIsModalOpen(false); // Close modal
        }}
      >
        {loading && <p>Loading...</p>}
        {secret !== null && connectInstance !== null && (
          <ConnectComponentsProvider connectInstance={connectInstance}>
            <ConnectAccountOnboarding
              onExit={() => console.log("The account has exited onboarding")}
            />
          </ConnectComponentsProvider>
        )}
      </Modal>
    </>
  );
}
