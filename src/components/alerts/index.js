"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import CircularProgress from "@mui/material/CircularProgress";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  border: "none",
};

export default function BasicModal(props) {
  return (
    <div>
      <Modal
        open={props?.isOpenAlert}
        onClose={() => props?.setOpenALert(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ color: `${props?.modalType == "warning" ? "red" : "black"}` }}
          >
            {props?.heading ? props?.heading : "-"}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {props?.description}
          </Typography>

          <Box
            sx={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={() => {
                props?.setOpenALert(false);
              }}
              className="cursor-pointer px-3 py-2 rounded-[8px] text-black"
            >
              Cancle
            </button>
            <button
              onClick={() => {
                props?.handleAction();
              }}
              className="cursor-pointer px-3 py-2 rounded-[8px] bg-gradient-to-r from-[#7DE143] to-[#055938] text-white"
            >
              Mange
              {props?.loading ? (
                <>
                  <CircularProgress
                    color="inherit"
                    sx={{ marginLeft: "6px" }}
                    size={15}
                  />
                </>
              ) : (
                ""
              )}
            </button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
